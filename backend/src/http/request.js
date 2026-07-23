const MAX_JSON_BODY_BYTES = 16 * 1024;

export async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_JSON_BODY_BYTES) {
      return {
        ok: false,
        statusCode: 413,
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request body is too large.",
        },
      };
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {
      ok: false,
      statusCode: 400,
      error: {
        code: "INVALID_JSON",
        message: "A JSON request body is required.",
      },
    };
  }

  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new SyntaxError("JSON body must be an object.");
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      statusCode: 400,
      error: {
        code: "INVALID_JSON",
        message: "Request body must be a valid JSON object.",
      },
    };
  }
}
