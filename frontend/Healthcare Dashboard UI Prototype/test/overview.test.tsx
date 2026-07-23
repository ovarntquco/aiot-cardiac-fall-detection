import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../src/app/api";
import { HomeScreen } from "../src/app/screens/HomeScreen";
import { apiFailure, apiSuccess, installApiMock } from "./api-mock";
import { overviewFixture } from "./fixtures";

describe("overview screen", () => {
  beforeEach(() => {
    setSessionToken("test-caregiver-token");
  });

  it("shows a loading state while the overview request is pending", async () => {
    let resolveRequest: ((response: Response) => void) | undefined;
    installApiMock(() => new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    }));

    render(<HomeScreen onNav={() => undefined} />);

    expect(screen.getByText("Dang tai tong quan")).toBeInTheDocument();

    await act(async () => {
      resolveRequest?.(apiSuccess(overviewFixture));
    });
    expect(await screen.findByText("78")).toBeInTheDocument();
  });

  it("renders health readings, units, thresholds, and backend status", async () => {
    installApiMock(() => apiSuccess(overviewFixture));

    render(<HomeScreen onNav={() => undefined} />);

    expect(await screen.findByText("78")).toBeInTheDocument();
    expect(screen.getByText("97")).toBeInTheDocument();
    expect(screen.getAllByText("BPM").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Do bao hoa oxy (SpO2)")).toBeInTheDocument();
    expect(screen.getAllByText("Binh thuong")).toHaveLength(2);
    expect(screen.getByText("Nguong nhip tim")).toBeInTheDocument();
    expect(screen.getByText("Nguong SpO2")).toBeInTheDocument();
  });

  it("renders the cardiac abnormal status returned by the backend", async () => {
    installApiMock(() => apiSuccess({
      ...overviewFixture,
      healthStatus: {
        overall: "ABNORMAL",
        heartRate: "ABNORMAL",
        spo2: "NORMAL",
      },
    }));

    render(<HomeScreen onNav={() => undefined} />);

    expect(await screen.findByText("78")).toBeInTheDocument();
    expect(screen.getAllByText("Canh bao")).toHaveLength(2);
  });

  it("shows a stale-data warning supplied by the overview API", async () => {
    installApiMock(() => apiSuccess({
      ...overviewFixture,
      dataFreshness: {
        isStale: true,
        ageSeconds: 7200,
        staleAfterSeconds: 900,
      },
    }));

    render(<HomeScreen onNav={() => undefined} />);

    expect(await screen.findByText("Du lieu suc khoe da cu")).toBeInTheDocument();
    expect(screen.getByText(/Ban ghi gan nhat duoc ghi nhan cach day 2 gio/)).toBeInTheDocument();
  });

  it("shows an empty state when there is no sensor measurement", async () => {
    installApiMock(() => apiSuccess({
      ...overviewFixture,
      latestMeasurement: null,
      recentMeasurements: [],
      healthStatus: {
        overall: "UNKNOWN",
        heartRate: "UNKNOWN",
        spo2: "UNKNOWN",
      },
      dataFreshness: null,
    }));

    render(<HomeScreen onNav={() => undefined} />);

    expect(await screen.findByText("Chua co du lieu do")).toBeInTheDocument();
    expect(screen.queryByText("Nhip tim")).not.toBeInTheDocument();
  });

  it("shows the API error and retry action when the overview request fails", async () => {
    installApiMock(() => apiFailure("Repository unavailable"));

    render(<HomeScreen onNav={() => undefined} />);

    expect(await screen.findByText("Khong the tai du lieu")).toBeInTheDocument();
    expect(screen.getByText("Repository unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thu lai" })).toBeInTheDocument();
  });
});
