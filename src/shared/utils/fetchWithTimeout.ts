interface FetchWithTimeoutInit extends RequestInit {
  timeoutMs: number;
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: FetchWithTimeoutInit,
) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), init.timeoutMs);
  const externalSignal = init.signal;

  const abortFromExternalSignal = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromExternalSignal);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutHandle);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
}
