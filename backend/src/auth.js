export function createAuthMiddleware(repository) {
  return async function authenticate(req, res) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      sendJson(res, 401, {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required to access patient data.",
        },
      });
      return null;
    }

    const user = await repository.findUserByToken(token);
    if (!user) {
      sendJson(res, 401, {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "The supplied session is not valid.",
        },
      });
      return null;
    }

    return user;
  };
}

export function ensurePatientAccess(req, res, user) {
  const requestedPatientId = new URL(req.url, "http://localhost").searchParams.get("patientId");
  const patientId = requestedPatientId || user.primaryPatientId;

  if (!user.accessiblePatientIds.includes(patientId)) {
    sendJson(res, 403, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission to access this patient.",
      },
    });
    return null;
  }

  return patientId;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}
