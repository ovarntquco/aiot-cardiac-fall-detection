import { useCallback, useEffect, useState } from "react";
import { Activity, Heart, RefreshCw } from "lucide-react";
import { fetchOverview, type OverviewResponse } from "../api";
import type { Screen } from "../types";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { MetricCard } from "../components/metrics/MetricCard";
import { ThresholdCard } from "../components/metrics/ThresholdCard";
import { formatDateTime, formatTime } from "../lib/format";
import { statusLabel, toMetricStatus } from "../lib/metricStatus";

export function HomeScreen({ onNav, patientId }: { onNav: (screen: Screen) => void; patientId?: string }) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await fetchOverview(patientId));
    } catch (loadError) {
      setOverview(null);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai du lieu tong quan.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const patientName = overview?.patient?.name || "Patient";
  const latest = overview?.latestMeasurement;
  const thresholds = overview?.thresholds;
  const hrStatus = toMetricStatus(overview?.healthStatus.heartRate || "UNKNOWN");
  const spo2Status = toMetricStatus(overview?.healthStatus.spo2 || "UNKNOWN");
  const hrData = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.heartRate,
  })) || [];
  const spo2Data = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.spo2,
  })) || [];

  return (
    <DashboardLayout
      screen={patientId ? "patients" : "home"}
      onNav={onNav}
      title="Overview"
      subtitle={`Dashboard - ${patientName}`}
      patientId={patientId}
      patientSection={patientId ? "overview" : undefined}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Data loaded from the API and system repository</p>
        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 self-start rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      {loading && <StateMessage title="Loading Overview" message="Querying the latest measurements and personal thresholds." />}
      {error && !loading && (
        <StateMessage title="Failed to load data" message={error} tone="error" actionLabel="Retry" onAction={() => void loadOverview()} />
      )}
      {!loading && !error && overview && !latest && (
        <StateMessage title="No measurements yet" message="The patient currently has no health measurements in the database." tone="empty" />
      )}
      {!loading && !error && overview && latest && !thresholds && (
        <StateMessage
          title="No personal thresholds set"
          message="Measurements exist but no threshold is defined to evaluate health status."
          tone="empty"
        />
      )}
      {!loading && !error && overview && (
        <>
          {latest && (
            <>
              <div className="mb-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <MetricCard
                    label="Heart Rate"
                    value={latest.heartRate}
                    unit="BPM"
                    status={hrStatus}
                    statusLabel={statusLabel(hrStatus)}
                    icon={<Heart size={16} />}
                    color="#EF4444"
                    data={hrData}
                    min={thresholds ? Math.min(40, thresholds.heartRateMin - 10) : 40}
                    max={thresholds ? Math.max(130, thresholds.heartRateMax + 10) : 130}
                    refLine={thresholds?.heartRateMax}
                  />
                  {thresholds && (
                    <ThresholdCard
                      icon={<Heart size={14} className="text-red-500" />}
                      title="Heart Rate Thresholds"
                      values={[
                        { label: "Min", value: thresholds.heartRateMin, unit: "BPM" },
                        { label: "Max", value: thresholds.heartRateMax, unit: "BPM" },
                      ]}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <MetricCard
                    label="Oxygen Saturation (SpO2)"
                    value={latest.spo2}
                    unit="%"
                    status={spo2Status}
                    statusLabel={statusLabel(spo2Status)}
                    icon={<Activity size={16} />}
                    color="#2563EB"
                    data={spo2Data}
                    min={85}
                    max={100}
                    refLine={thresholds?.spo2Min}
                  />
                  {thresholds && (
                    <ThresholdCard
                      icon={<Activity size={14} className="text-primary" />}
                      title="SpO2 Thresholds"
                      values={[
                        { label: "Min", value: thresholds.spo2Min, unit: "%" },
                        { label: "Max", value: thresholds.spo2Max, unit: "%" },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 text-sm shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <p className="text-xs text-muted-foreground">Last measurement time</p>
                <p className="font-semibold text-foreground">{formatDateTime(latest.measuredAt)}</p>
              </div>
            </>
          )}

          {!latest && thresholds && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ThresholdCard
                icon={<Heart size={14} className="text-red-500" />}
                title="Applied Heart Rate Thresholds"
                values={[
                  { label: "Min", value: thresholds.heartRateMin, unit: "BPM" },
                  { label: "Max", value: thresholds.heartRateMax, unit: "BPM" },
                ]}
              />
              <ThresholdCard
                icon={<Activity size={14} className="text-primary" />}
                title="Applied SpO2 Thresholds"
                values={[
                  { label: "Min", value: thresholds.spo2Min, unit: "%" },
                  { label: "Max", value: thresholds.spo2Max, unit: "%" },
                ]}
              />
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

