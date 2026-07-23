import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../src/app/api";
import { AlertHistoryScreen } from "../src/app/screens/AlertHistoryScreen";
import { apiSuccess, installApiMock } from "./api-mock";
import {
  cardiacAlertDetailFixture,
  cardiacAlertSummaryFixture,
} from "./fixtures";

describe("alert history screen", () => {
  beforeEach(() => {
    setSessionToken("test-caregiver-token");
  });

  it("loads the list, opens the selected cardiac alert, and renders nullable detail safely", async () => {
    installApiMock(({ method, url }) => {
      if (method === "GET" && url.pathname === "/api/alerts") {
        return apiSuccess([cardiacAlertSummaryFixture]);
      }
      if (method === "GET" && url.pathname === "/api/alerts/ALERT_CARDIAC_001") {
        return apiSuccess(cardiacAlertDetailFixture);
      }
      throw new Error(`Unexpected request: ${method} ${url.pathname}`);
    });
    const user = userEvent.setup();

    render(<AlertHistoryScreen onNav={() => undefined} />);

    expect(screen.getByText("Dang tai lich su")).toBeInTheDocument();
    const alertButton = await screen.findByRole("button", {
      name: /Phat hien bat thuong tim mach/,
    });
    expect(screen.getByText(/CARDIAC_ABNORMAL/)).toBeInTheDocument();

    await user.click(alertButton);

    expect(await screen.findByText("ALERT_CARDIAC_001")).toBeInTheDocument();
    expect(screen.getAllByText("Khong co").length).toBeGreaterThanOrEqual(4);
    expect(alertButton).toHaveAttribute("aria-expanded", "true");
  });
});
