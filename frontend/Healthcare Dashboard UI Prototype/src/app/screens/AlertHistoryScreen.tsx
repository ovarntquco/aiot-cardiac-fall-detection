import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { fetchAlertDetail, fetchAlerts, type AlertDetail, type AlertSummary } from "../api";
import type { Screen } from "../types";
import { DetailCell } from "../components/common/DetailCell";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { formatDateTime } from "../lib/format";
import { severityStyle } from "../lib/metricStatus";

export function AlertHistoryScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [details, setDetails] = useState<Record<string, AlertDetail>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    setExpanded(null);
    try {
      setAlerts(await fetchAlerts());
    } catch (loadError) {
      setAlerts([]);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai lich su canh bao.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }

    setExpanded(id);
    setDetailError(null);
    if (details[id]) return;

    setDetailLoading(id);
    try {
      const detail = await fetchAlertDetail(id);
      setDetails((current) => ({ ...current, [id]: detail }));
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "Khong the tai chi tiet canh bao.");
    } finally {
      setDetailLoading(null);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <DashboardLayout screen="alerts" onNav={onNav} title="Lich su canh bao" subtitle="Tat ca canh bao cua benh nhan duoc lay tu database">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {loading ? "Dang tai danh sach canh bao" : `${alerts.length} canh bao`}
          </p>
          <button onClick={loadAlerts} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <RefreshCw size={13} />
            Lam moi
          </button>
        </div>

        {loading && <StateMessage title="Dang tai lich su" message="Dang truy van canh bao moi nhat truoc." />}
        {error && !loading && <StateMessage title="Khong the tai canh bao" message={error} tone="error" />}
        {!loading && !error && alerts.length === 0 && (
          <StateMessage title="Chua co canh bao" message="Database chua co canh bao nao cho benh nhan nay." tone="empty" />
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isOpen = expanded === alert.id;
              const detail = details[alert.id];
              const sty = severityStyle(alert.severity);

              return (
                <div key={alert.id} className="bg-card rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-sm">
                  <button className="w-full flex items-center gap-4 px-6 py-4 text-left" onClick={() => void toggleAlert(alert.id)}>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sty.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{alert.message}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sty.badge}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.type} - {alert.status || "NEW"} - {formatDateTime(alert.occurredAt)}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-6 py-5 bg-background">
                      {detailLoading === alert.id && <StateMessage title="Dang tai chi tiet" message="Dang lay thong tin canh bao theo ID." compact />}
                      {detailError && !detailLoading && <StateMessage title="Khong the tai chi tiet" message={detailError} tone="error" compact />}
                      {detail && !detailLoading && (
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <DetailCell label="ID" value={detail.id} />
                            <DetailCell label="Thoi gian" value={formatDateTime(detail.occurredAt)} />
                            <DetailCell label="Nhip tim" value={detail.heartRate === null ? "Khong co" : `${detail.heartRate} bpm`} />
                            <DetailCell label="SpO2" value={detail.spo2 === null ? "Khong co" : `${detail.spo2}%`} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <DetailCell label="Loai" value={detail.type} />
                            <DetailCell label="Muc do" value={detail.severity} />
                            <DetailCell label="Xac suat te nga" value={detail.fallProbability === null ? "Khong co" : `${Math.round(detail.fallProbability * 100)}%`} />
                          </div>
                          <div className="bg-card rounded-lg border border-border p-3.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Noi dung canh bao</p>
                            <p className="text-sm text-foreground">{detail.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
