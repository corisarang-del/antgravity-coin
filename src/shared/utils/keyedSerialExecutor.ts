const queues = new Map<string, Promise<unknown>>();

export async function runSerializedByKey<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();

  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });

  queues.set(key, previous.catch(() => undefined).then(() => current));

  await previous.catch(() => undefined);

  try {
    return await task();
  } finally {
    release();

    if (queues.get(key) === current) {
      queues.delete(key);
    }
  }
}
