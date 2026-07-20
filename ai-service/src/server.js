import http from "node:http";
import { createFallInferenceModule } from "./modules/fall-inference/index.js";

const defaultPort = Number(process.env.AI_SERVICE_PORT || 3101);

export function createServer() {
  const routes = createFallInferenceModule();

  return http.createServer((req, res) => {
    const route = routes.find((candidate) => candidate.method === req.method && candidate.path === new URL(req.url, "http://localhost").pathname);
    if (!route) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Route not found." } }));
      return;
    }

    return route.handler(req, res);
  });
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  createServer().listen(defaultPort, () => {
    console.log(`CareWatch AI placeholder listening on http://localhost:${defaultPort}`);
  });
}
