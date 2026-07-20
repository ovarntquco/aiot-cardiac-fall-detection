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
import { getHeartRateStatus, getSpo2Status, statusLabel } from "../lib/metricStatus";

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
  const hrStatus = latest && thresholds ? getHeartRateStatus(latest.heartRate, thresholds) : "warning";
  const spo2Status = latest && thresholds ? getSpo2Status(latest.spo2, thresholds) : "warning";
  const hrData = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.heartRate,
  })) || [];
  const spo2Data = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.spo2,
  })) || [];

  return (
    <DashboardLayout screen="home" onNav={onNav} title="Tong quan" subtitle={`Bang dieu khien - ${patientName}`}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">Du lieu duoc tai tu API va repository cua he thong</p>
        <button onClick={loadOverview} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <RefreshCw size={13} />
          Lam moi
        </button>
      </div>

      {loading && <StateMessage title="Dang tai tong quan" message="Dang truy van chi so moi nhat va nguong ca nhan." />}
      {error && !loading && <StateMessage title="Khong the tai du lieu" message={error} tone="error" />}
      {!loading && !error && overview && !latest && (
        <StateMessage title="Chua co du lieu do" message="Benh nhan hien chua co ban ghi do suc khoe nao trong database." tone="empty" />
      )}

      {!loading && !error && overview && latest && thresholds && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatusTile label="Trang thai thiet bi" value={overview.patient?.deviceStatus === "CONNECTED" ? "Da ket noi" : "Chua ket noi"} icon={<Wifi size={14} />} />
            <StatusTile label="Canh bao hom nay" value={`${overview.alertCountToday} canh bao`} icon={<Bell size={14} />} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 items-start">
            <div className="flex flex-col gap-4">
              <MetricCard
                label="Nhip tim"
                value={latest.heartRate}
                unit="bpm"
                status={hrStatus}
                statusLabel={statusLabel(hrStatus)}
                icon={<Heart size={16} />}
                color="#EF4444"
                data={hrData}
                min={Math.min(40, thresholds.heartRateMin - 10)}
                max={Math.max(130, thresholds.heartRateMax + 10)}
                refLine={thresholds.heartRateMax}
              />
              <ThresholdCard
                icon={<Heart size={14} className="text-red-500" />}
                title="Nguong nhip tim"
                values={[
                  { label: "Toi thieu", value: thresholds.heartRateMin, unit: "bpm" },
                  { label: "Toi da", value: thresholds.heartRateMax, unit: "bpm" },
                ]}
              />
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
                refLine={thresholds.spo2Min}
              />
              <ThresholdCard
                icon={<Activity size={14} className="text-primary" />}
                title="Nguong SpO2"
                values={[
                  { label: "Toi thieu", value: thresholds.spo2Min, unit: "%" },
                  { label: "Toi da", value: thresholds.spo2Max, unit: "%" },
                ]}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Thoi gian do gan nhat</p>
              <p className="font-semibold text-foreground">{formatDateTime(latest.measuredAt)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              Lay ban ghi suc khoe moi nhat theo thoi gian do
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
