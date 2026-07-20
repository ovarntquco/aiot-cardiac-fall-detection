import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC1 / FR1: Login. Scaffold only; production auth is not implemented here.
export function createAuthModule() {
  return [
    route("POST", "/api/auth/login", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC1",
      requirements: ["FR1"],
    })),
  ];
}
