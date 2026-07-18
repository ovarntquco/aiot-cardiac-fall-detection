// UC9 / FR13-FR14: AI fall-detection inference scaffold only.
// TODO: wire a real trained model, input validation, and model-version metadata.
export function createFallInferenceModule() {
  return [
    {
      method: "POST",
      path: "/api/fall-inference",
      handler(_req, res) {
        res.writeHead(501, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "FEATURE_NOT_IMPLEMENTED",
            message: "This feature is scaffolded but not implemented yet.",
            useCase: "UC9",
            requirements: ["FR13", "FR14"],
          },
        }));
      },
    },
  ];
}
