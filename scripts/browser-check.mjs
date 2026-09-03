import { spawnSync } from "node:child_process";

const targetUrl = process.argv[2] ?? "http://localhost:3000";
const command = process.platform === "win32" ? "agent-browser.cmd" : "agent-browser";

function run(args, { allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (!allowFailure && result.status !== 0) {
    throw new Error(`agent-browser ${args[0]} failed with exit code ${result.status}`);
  }
}

try {
  run(["open", targetUrl]);
  run(["wait", "--load", "networkidle"]);
  run([
    "eval",
    `(() => {
      const overlay = document.querySelector(
        "[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay"
      );
      if (overlay) throw new Error("Framework error overlay detected");
      if (!document.body.innerText.trim()) throw new Error("Page rendered without visible content");
      return JSON.stringify({ status: "OK", title: document.title });
    })()`,
  ]);
  run(["snapshot", "-i"]);
  run(["screenshot", "--annotate"]);
  console.log(`Browser check passed: ${targetUrl}`);
} finally {
  run(["close"], { allowFailure: true });
}
