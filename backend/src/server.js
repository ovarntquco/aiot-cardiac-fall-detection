import http from "node:http";
import { fileURLToPath } from "node:url";
import { JsonHealthRepository } from "./data/json-health.repository.js";
import { createRoutes } from "./modules/index.js";
import { matchRoute } from "./http/router.js";
import { sendJson, setCorsHeaders } from "./http/response.js";
import { createLocalAlertEventPublisher } from "./modules/local-alert/local-alert-event.publisher.js";
import { createStructuredLogger } from "./observability/structured-logger.js";

const defaultPort = Number(process.env.PORT || 3001);

export function createServer({
  repository = new JsonHealthRepository(),
  now = () => new Date(),
  monotonicNow = () => performance.now(),
  localAlertPublisher = createLocalAlertEventPublisher(),
  logger = createStructuredLogger(),
} = {}) {
  const routes = createRoutes({
    repository,
    now,
    monotonicNow,
    localAlertPublisher,
    logger,
  });

  return http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const match = matchRoute(routes, req.method, url.pathname);

    if (!match) {
      return sendJson(res, 404, {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Route not found.",
        },
      });
    }

    try {
      return await match.route.handler({
        req,
        res,
        url,
        params: match.params,
      });
    } catch (error) {
      return sendJson(res, 500, {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Could not load data from the repository.",
        },
      });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer().listen(defaultPort, () => {
    console.log(`CareWatch API listening on http://localhost:${defaultPort}`);
  });
}
