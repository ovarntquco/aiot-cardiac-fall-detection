import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../src/app/App";
import { setSessionToken } from "../src/app/api";
import { DashboardLayout } from "../src/app/components/layout/DashboardLayout";
import { apiSuccess, installApiMock } from "./api-mock";
import { overviewFixture, thresholdSettingsFixture } from "./fixtures";

describe("application shell navigation", () => {
  beforeEach(() => {
    setSessionToken("test-caregiver-token");
    window.history.replaceState({}, "", "/overview");
    installApiMock(({ method, url }) => {
      if (method === "GET" && url.pathname === "/api/overview") {
        return apiSuccess(overviewFixture);
      }
      if (method === "GET" && url.pathname === "/api/alerts") {
        return apiSuccess([]);
      }
      if (method === "GET" && url.pathname === "/api/personal-thresholds") {
        return apiSuccess(thresholdSettingsFixture);
      }
      throw new Error(`Unexpected request: ${method} ${url.pathname}`);
    });
  });

  it("navigates between Overview, Alerts, GPS, and Settings", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Tong quan" })).toBeInTheDocument();

    await user.click(within(getMainNavigation()).getByRole("button", { name: "Canh bao" }));
    expect(await screen.findByRole("heading", { name: "Lich su canh bao" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/alerts");

    await user.click(within(getMainNavigation()).getByRole("button", { name: "GPS" }));
    expect(await screen.findByRole("heading", { name: "Vi tri benh nhan" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/gps");

    await user.click(within(getMainNavigation()).getByRole("button", { name: "Cai dat" }));
    expect(await screen.findByRole("heading", { name: "Cai dat" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/settings");

    await user.click(within(getMainNavigation()).getByRole("button", { name: "Tong quan" }));
    await waitFor(() => expect(window.location.pathname).toBe("/overview"));
  });

  it("renders the mobile navigation at a mobile viewport", () => {
    setViewportWidth(390);

    render(
      <DashboardLayout screen="home" onNav={() => undefined} title="Tong quan">
        <p>Noi dung</p>
      </DashboardLayout>,
    );

    const navigation = screen.getByRole("navigation", { name: "Dieu huong chinh" });
    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveClass("lg:hidden");
    expect(within(navigation).getByRole("button", { name: "Tong quan" })).toHaveAttribute("aria-current", "page");
  });
});

function getMainNavigation() {
  return screen.getByRole("navigation", { name: "Dieu huong chinh" });
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}
