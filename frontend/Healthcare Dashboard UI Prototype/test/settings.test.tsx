import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../src/app/api";
import { SettingsScreen } from "../src/app/screens/SettingsScreen";
import {
  apiFailure,
  apiSuccess,
  installApiMock,
  type MockApiRequest,
} from "./api-mock";
import { thresholdSettingsFixture } from "./fixtures";

describe("personal threshold settings", () => {
  beforeEach(() => {
    setSessionToken("test-caregiver-token");
  });

  it("rejects min values greater than or equal to max before calling the API", async () => {
    const requests: MockApiRequest[] = [];
    installThresholdApi(requests);
    const user = userEvent.setup();

    render(<SettingsScreen onNav={() => undefined} />);
    const minInput = await screen.findByLabelText("Nhip tim toi thieu");

    await user.clear(minInput);
    await user.type(minInput, "100");
    await user.click(screen.getByRole("button", { name: "Luu thay doi" }));

    expect(screen.getByText("Gia tri toi thieu phai nho hon toi da.")).toBeInTheDocument();
    expect(screen.getByText("Gia tri toi da phai lon hon toi thieu.")).toBeInTheDocument();
    expect(requests.filter((request) => request.method === "PUT")).toHaveLength(0);
  });

  it("saves valid thresholds after confirmation and shows persisted values", async () => {
    const requests: MockApiRequest[] = [];
    installThresholdApi(requests, {
      updateResponse: {
        ...thresholdSettingsFixture,
        thresholds: {
          ...thresholdSettingsFixture.thresholds,
          heartRateMin: 55,
        },
      },
    });
    const user = userEvent.setup();

    render(<SettingsScreen onNav={() => undefined} />);
    const minInput = await screen.findByLabelText("Nhip tim toi thieu");
    await user.clear(minInput);
    await user.type(minInput, "55");
    await user.click(screen.getByRole("button", { name: "Luu thay doi" }));

    expect(screen.getByRole("alertdialog", { name: "Xac nhan luu nguong?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xac nhan luu" }));

    expect(await screen.findByText("Da luu nguong")).toBeInTheDocument();
    expect(within(currentThresholds()).getByText("55")).toBeInTheDocument();
    const updateRequest = requests.find((request) => request.method === "PUT");
    expect(updateRequest?.body).toEqual({
      heartRateMin: 55,
      heartRateMax: 100,
      spo2Min: 95,
      spo2Max: 100,
    });
  });

  it("keeps the applied thresholds unchanged when backend persistence fails", async () => {
    installThresholdApi([], { updateFailure: true });
    const user = userEvent.setup();

    render(<SettingsScreen onNav={() => undefined} />);
    const minInput = await screen.findByLabelText("Nhip tim toi thieu");
    expect(within(currentThresholds()).getByText("60")).toBeInTheDocument();

    await user.clear(minInput);
    await user.type(minInput, "55");
    await user.click(screen.getByRole("button", { name: "Luu thay doi" }));
    await user.click(screen.getByRole("button", { name: "Xac nhan luu" }));

    expect(await screen.findByText("Khong the luu nguong")).toBeInTheDocument();
    expect(within(currentThresholds()).getByText("60")).toBeInTheDocument();
    expect(within(currentThresholds()).queryByText("55")).not.toBeInTheDocument();
  });

  it("restores configured defaults only after confirmation", async () => {
    const requests: MockApiRequest[] = [];
    installThresholdApi(requests, {
      initial: {
        ...thresholdSettingsFixture,
        thresholds: {
          ...thresholdSettingsFixture.thresholds,
          heartRateMin: 55,
        },
      },
    });
    const user = userEvent.setup();

    render(<SettingsScreen onNav={() => undefined} />);
    expect(await screen.findByLabelText("Nhip tim toi thieu")).toHaveValue("55");

    await user.click(screen.getByRole("button", { name: "Khoi phuc mac dinh" }));
    expect(screen.getByRole("alertdialog", { name: "Khoi phuc nguong mac dinh?" })).toBeInTheDocument();
    expect(requests.filter((request) => request.method === "POST")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Xac nhan khoi phuc" }));

    expect(await screen.findByText("Da khoi phuc mac dinh")).toBeInTheDocument();
    expect(within(currentThresholds()).getByText("60")).toBeInTheDocument();
    await waitFor(() => {
      expect(requests.filter((request) => request.method === "POST")).toHaveLength(1);
    });
  });
});

function currentThresholds() {
  return screen.getByLabelText("Nguong hien tai dang ap dung");
}

function installThresholdApi(
  requests: MockApiRequest[],
  options: {
    initial?: typeof thresholdSettingsFixture;
    updateFailure?: boolean;
    updateResponse?: typeof thresholdSettingsFixture;
  } = {},
) {
  installApiMock((request) => {
    requests.push(request);

    if (request.method === "GET" && request.url.pathname === "/api/personal-thresholds") {
      return apiSuccess(options.initial || thresholdSettingsFixture);
    }
    if (request.method === "PUT" && request.url.pathname === "/api/personal-thresholds") {
      if (options.updateFailure) {
        return apiFailure("Database write failed");
      }
      return apiSuccess(options.updateResponse || thresholdSettingsFixture);
    }
    if (
      request.method === "POST"
      && request.url.pathname === "/api/personal-thresholds/restore-defaults"
    ) {
      return apiSuccess(thresholdSettingsFixture);
    }
    throw new Error(`Unexpected request: ${request.method} ${request.url.pathname}`);
  });
}
