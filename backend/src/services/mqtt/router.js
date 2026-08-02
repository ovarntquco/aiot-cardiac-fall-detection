import { param } from "express-validator";

class MqttRouter {
  constructor() {
    this.routes = [];
    this.globalMiddlewares = [];
  }

  use(fn) {
    this.globalMiddlewares.push(fn);
    return this;
  }

  on(pattern, ...handlers) {
    const regex = this._patternToRegex(pattern);
    this.routes.push({ pattern, regex, handlers });
    return this;
  }

  _patternToRegex(pattern) {
    const escaped = pattern
      .split("/")
      .map((seg) => (seg === "+" ? "([^/]+)" : seg === "#" ? "(.+)" : seg))
      .join("/");
    return new RegExp(`^${escaped}$`);
  }

  async handle(topic, message) {
    for (const route of this.routes) {
      const match = topic.match(route.regex);

      if (!match) {
        continue;
      }

      const params = match.slice(1);
      const ctx = { topic, message, params, data: null };

      const allHandlers = [...this.globalMiddlewares, ...route.handlers];
      await this._runChain(allHandlers, ctx);
      return;
    }
    console.warn(`[MqttRouter] No route matched for topic: ${topic}`);
  }

  async _runChain(handlers, ctx) {
    let i = 0;
    const next = async () => {
      if (i >= handlers.length) {
        return;
      }

      const handler = handlers[i++];
      await handler(ctx, next);
    };
    await next();
  }
}

export default MqttRouter;
