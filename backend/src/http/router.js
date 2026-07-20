export function route(method, pattern, handler) {
  return {
    method,
    pattern,
    handler,
    compiled: compilePattern(pattern),
  };
}

export function matchRoute(routes, method, pathname) {
  for (const candidate of routes) {
    if (candidate.method !== method) continue;

    const match = candidate.compiled.regex.exec(pathname);
    if (!match) continue;

    const params = Object.fromEntries(
      candidate.compiled.keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]),
    );

    return { route: candidate, params };
  }

  return null;
}

function compilePattern(pattern) {
  const keys = [];
  const regexPattern = pattern
    .split("/")
    .map((part) => {
      if (part.startsWith(":")) {
        keys.push(part.slice(1));
        return "([^/]+)";
      }
      return escapeRegex(part);
    })
    .join("/");

  return {
    keys,
    regex: new RegExp(`^${regexPattern}$`),
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
