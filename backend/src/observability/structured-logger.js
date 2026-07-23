export function createStructuredLogger(output = console) {
  return {
    error(event, context = {}) {
      output.error(JSON.stringify({
        level: "error",
        event,
        ...context,
      }));
    },
  };
}
