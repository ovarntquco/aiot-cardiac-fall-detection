import { vi, type Mock } from "vitest";

export type MockApiRequest = {
  body: unknown;
  method: string;
  url: URL;
};

type ApiHandler = (request: MockApiRequest) => Promise<Response> | Response;

export function installApiMock(handler: ApiHandler): Mock {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const rawUrl = input instanceof Request ? input.url : String(input);
      const method = init?.method || (input instanceof Request ? input.method : "GET");
      const rawBody = init?.body;
      let body: unknown;

      if (typeof rawBody === "string" && rawBody) {
        body = JSON.parse(rawBody);
      }

      return handler({
        body,
        method,
        url: new URL(rawUrl, window.location.origin),
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function apiSuccess(data: unknown, status = 200) {
  return jsonResponse({ success: true, data }, status);
}

export function apiFailure(
  message: string,
  status = 500,
  options: { code?: string; fields?: Record<string, string> } = {},
) {
  return jsonResponse({
    success: false,
    error: {
      code: options.code || "TEST_API_ERROR",
      message,
      fields: options.fields,
    },
  }, status);
}

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
