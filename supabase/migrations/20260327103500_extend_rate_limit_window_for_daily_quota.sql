create or replace function public.consume_request_rate_limit(
  p_bucket text,
  p_key text,
  p_max_count integer,
  p_window_ms integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_store_key text := concat(p_bucket, ':', p_key);
  v_window public.request_rate_limits%rowtype;
  v_reset_at timestamptz;
begin
  if p_bucket is null or length(trim(p_bucket)) = 0 or length(p_bucket) > 120 then
    raise exception 'invalid_bucket';
  end if;

  if p_key is null or length(trim(p_key)) = 0 or length(p_key) > 256 then
    raise exception 'invalid_key';
  end if;

  if p_max_count < 1 or p_max_count > 1000 then
    raise exception 'invalid_max_count';
  end if;

  if p_window_ms < 1000 or p_window_ms > 86400000 then
    raise exception 'invalid_window_ms';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_store_key, 0));

  delete from public.request_rate_limits as limits
  where limits.reset_at <= v_now;

  select *
  into v_window
  from public.request_rate_limits as limits
  where limits.store_key = v_store_key
  for update;

  if not found then
    v_reset_at := v_now + make_interval(secs => p_window_ms::numeric / 1000);

    insert into public.request_rate_limits (
      store_key,
      bucket,
      subject_key,
      count,
      reset_at
    ) values (
      v_store_key,
      p_bucket,
      p_key,
      1,
      v_reset_at
    );

    return query
    select
      true,
      greatest(0, p_max_count - 1),
      ceil(p_window_ms::numeric / 1000)::integer,
      v_reset_at;
    return;
  end if;

  v_window.count := v_window.count + 1;
  v_window.updated_at := v_now;

  update public.request_rate_limits as limits
  set count = v_window.count,
      updated_at = v_window.updated_at
  where limits.store_key = v_store_key;

  return query
  select
    v_window.count <= p_max_count,
    greatest(0, p_max_count - v_window.count),
    greatest(1, ceil(extract(epoch from (v_window.reset_at - v_now))))::integer,
    v_window.reset_at;
end;
$$;

grant execute on function public.consume_request_rate_limit(text, text, integer, integer)
to anon, authenticated;
