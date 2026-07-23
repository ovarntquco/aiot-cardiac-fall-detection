import { useEffect, useState } from "react";
import { Activity, Bell, Heart, RefreshCw, TrendingUp, Wifi } from "lucide-react";
import { fetchOverview, type OverviewResponse } from "../api";
import type { Screen } from "../types";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { MetricCard } from "../components/metrics/MetricCard";
import { StatusTile } from "../components/metrics/StatusTile";
import { ThresholdCard } from "../components/metrics/ThresholdCard";
import { formatDateTime, formatTime } from "../lib/format";
import { statusLabel, toMetricStatus } from "../lib/metricStatus";

export function HomeScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await fetchOverview());
    } catch (loadError) {
      setOverview(null);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai du lieu tong quan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const patientName = overview?.patient?.name || "Benh nhan";
  const latest = overview?.latestMeasurement;
  const thresholds = overview?.thresholds;
  const freshness = overview?.dataFreshness;
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
      screen="home"
      onNav={onNav}
      title="Tong quan"
      subtitle={`Bang dieu khien - ${patientName}`}
      patient={overview?.patient}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Du lieu duoc tai tu API va repository cua he thong</p>
        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 self-start rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Dang tai" : "Lam moi"}
        </button>
      </div>

      {loading && <StateMessage title="Dang tai tong quan" message="Dang truy van chi so moi nhat va nguong ca nhan." />}
      {error && !loading && (
        <StateMessage title="Khong the tai du lieu" message={error} tone="error" actionLabel="Thu lai" onAction={() => void loadOverview()} />
      )}
      {!loading && !error && overview && !latest && (
        <StateMessage title="Chua co du lieu do" message="Benh nhan hien chua co ban ghi do suc khoe nao trong database." tone="empty" />
      )}
      {!loading && !error && overview && latest && !thresholds && (
        <StateMessage
          title="Chua co nguong ca nhan"
          message="Da co du lieu do nhung chua co nguong de danh gia trang thai suc khoe."
          tone="empty"
        />
      )}
      {!loading && !error && overview && freshness?.isStale && (
        <div className="mb-6">
          <StateMessage
            title="Du lieu suc khoe da cu"
            message={`Ban ghi gan nhat duoc ghi nhan cach day ${formatAge(freshness.ageSeconds)}. Hay kiem tra ket noi thiet bi truoc khi dua ra ket luan.`}
            tone="warning"
          />
        </div>
      )}

      {!loading && !error && overview && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatusTile label="Trang thai thiet bi" value={formatDeviceStatus(overview.patient?.deviceStatus)} icon={<Wifi size={14} />} />
            <StatusTile
              label="Do moi du lieu"
              value={freshness ? (freshness.isStale ? "Du lieu cu" : "Du lieu moi") : "Chua co du lieu"}
              icon={<TrendingUp size={14} />}
            />
            <StatusTile label="Canh bao hom nay" value={`${overview.alertCountToday} canh bao`} icon={<Bell size={14} />} />
          </div>

          {latest && (
            <>
              <div className="mb-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <MetricCard
                    label="Nhip tim"
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
                      title="Nguong nhip tim"
                      values={[
                        { label: "Toi thieu", value: thresholds.heartRateMin, unit: "BPM" },
                        { label: "Toi da", value: thresholds.heartRateMax, unit: "BPM" },
                      ]}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <MetricCard
                    label="Do bao hoa oxy (SpO2)"
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
                      title="Nguong SpO2"
                      values={[
                        { label: "Toi thieu", value: thresholds.spo2Min, unit: "%" },
                        { label: "Toi da", value: thresholds.spo2Max, unit: "%" },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Thoi diem du lieu gan nhat</p>
                  <p className="font-semibold text-foreground">{formatDateTime(latest.measuredAt)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp size={12} />
                  {freshness?.isStale ? `Du lieu cu - cach day ${formatAge(freshness.ageSeconds)}` : "Ban ghi moi nhat trong repository"}
                </div>
              </div>
            </>
          )}

          {!latest && thresholds && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ThresholdCard
                icon={<Heart size={14} className="text-red-500" />}
                title="Nguong nhip tim dang ap dung"
                values={[
                  { label: "Toi thieu", value: thresholds.heartRateMin, unit: "BPM" },
                  { label: "Toi da", value: thresholds.heartRateMax, unit: "BPM" },
                ]}
              />
              <ThresholdCard
                icon={<Activity size={14} className="text-primary" />}
                title="Nguong SpO2 dang ap dung"
                values={[
                  { label: "Toi thieu", value: thresholds.spo2Min, unit: "%" },
                  { label: "Toi da", value: thresholds.spo2Max, unit: "%" },
                ]}
              />
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function formatDeviceStatus(status?: string) {
  if (status === "CONNECTED") return "Da ket noi";
  if (status === "DISCONNECTED") return "Mat ket noi";
  return status ? "Khong xac dinh" : "Chua co thong tin";
}

function formatAge(ageSeconds: number | null) {
  if (ageSeconds === null) return "khong xac dinh";
  if (ageSeconds < 60) return `${ageSeconds} giay`;
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)} phut`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)} gio`;
  return `${Math.floor(ageSeconds / 86400)} ngay`;
}
