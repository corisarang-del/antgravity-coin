import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inMemoryStore = new Map<string, string>();

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isReadOnlyFsError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? error.code : null;
  return code === "EROFS" || code === "EPERM" || code === "EACCES";
}

async function ensureDirectory(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }
  }
}

export async function loadJsonFileStore<T>(filePath: string, initialValue: T): Promise<T> {
  const memoryValue = inMemoryStore.get(filePath);

  if (memoryValue) {
    return JSON.parse(memoryValue) as T;
  }

  await ensureDirectory(path.dirname(filePath));

  try {
    const rawValue = await readFile(filePath, "utf8");
    return JSON.parse(rawValue) as T;
  } catch (error) {
    const nextValue = cloneValue(initialValue);

    try {
      await writeFile(filePath, JSON.stringify(nextValue, null, 2), "utf8");
    } catch (writeError) {
      if (!isReadOnlyFsError(writeError)) {
        throw writeError;
      }

      inMemoryStore.set(filePath, JSON.stringify(nextValue));
    }

    if (isReadOnlyFsError(error)) {
      return nextValue;
    }

    return nextValue;
  }
}

export async function saveJsonFileStore<T>(filePath: string, value: T) {
  const serialized = JSON.stringify(value, null, 2);

  try {
    await ensureDirectory(path.dirname(filePath));
    await writeFile(filePath, serialized, "utf8");
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }

    inMemoryStore.set(filePath, serialized);
  }
}
