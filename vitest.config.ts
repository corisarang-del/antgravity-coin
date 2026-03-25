import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";

function loadLocalEnvFile() {
  const envPath = path.resolve(__dirname, ".env.local");

  try {
    const file = readFileSync(envPath, "utf8");
    const parsedEntries = file
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
          return null;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null);

    return Object.fromEntries(parsedEntries);
  } catch {
    return {};
  }
}

export default defineConfig(({ mode }) => {
  void mode;
  const env = loadLocalEnvFile();
  process.env = {
    ...process.env,
    ...env,
  };

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./vitest.setup.ts",
      exclude: ["bootstrap-app/**", "backup-worktree/**", "node_modules/**", ".next/**", "tmp/**"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
