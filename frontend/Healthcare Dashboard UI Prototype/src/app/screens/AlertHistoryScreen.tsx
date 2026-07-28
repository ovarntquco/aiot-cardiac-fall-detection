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
  const [detailError, setDetailError] = useState<{ id: string; message: string } | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    setExpanded(null);
    setDetailError(null);
    try {
      const loadedAlerts = await fetchAlerts();
      setAlerts(loadedAlerts);
      setDetails({});
    } catch (loadError) {
      setAlerts([]);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai lich su canh bao.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string, forceReload = false) => {
    if (expanded === id && !forceReload) {
      setExpanded(null);
      return;
    }

    setExpanded(id);
    setDetailError(null);
    if (details[id] && !forceReload) return;

    setDetailLoading(id);
    try {
      const detail = await fetchAlertDetail(id);
      setDetails((current) => ({ ...current, [id]: detail }));
    } catch (loadError) {
      setDetailError({
        id,
        message: loadError instanceof Error ? loadError.message : "Khong the tai chi tiet canh bao.",
      });
    } finally {
      setDetailLoading(null);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <DashboardLayout screen="alerts" onNav={onNav} title="Lich su canh bao" subtitle="Tat ca canh bao cua benh nhan duoc lay tu database">
      <div className="max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Dang tai danh sach canh bao" : `${alerts.length} canh bao`}
          </p>
          <button
            type="button"
            onClick={loadAlerts}
            disabled={loading}
            className="flex min-h-12 flex-shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Dang tai" : "Lam moi"}
          </button>
        </div>

        {loading && <StateMessage title="Dang tai lich su" message="Dang truy van canh bao moi nhat truoc." />}
        {error && !loading && (
          <StateMessage title="Khong the tai canh bao" message={error} tone="error" actionLabel="Thu lai" onAction={() => void loadAlerts()} />
        )}
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
                  <button
                    type="button"
                    className="flex min-h-16 w-full items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 sm:items-center sm:gap-4 sm:px-6"
                    onClick={() => void toggleAlert(alert.id)}
                    aria-expanded={isOpen}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sty.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{alert.message}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sty.badge}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.type} - {alert.status || "NEW"} - {formatAlertDateTime(alert.occurredAt)}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border bg-background px-4 py-5 sm:px-6">
                      {detailLoading === alert.id && <StateMessage title="Dang tai chi tiet" message="Dang lay thong tin canh bao theo ID." compact />}
                      {detailError?.id === alert.id && !detailLoading && (
                        <StateMessage
                          title="Khong the tai chi tiet"
                          message={detailError.message}
                          tone="error"
                          compact
                          actionLabel="Thu lai"
                          onAction={() => void toggleAlert(alert.id, true)}
                        />
                      )}
                      {detail && !detailLoading && (
                        <>
                          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailCell label="ID" value={detail.id} />
                            <DetailCell label="Thoi gian" value={formatAlertDateTime(detail.occurredAt)} />
                            <DetailCell label="Nhip tim" value={detail.heartRate === null ? "Khong co" : `${detail.heartRate} BPM`} />
                            <DetailCell label="SpO2" value={detail.spo2 === null ? "Khong co" : `${detail.spo2}%`} />
                          </div>
                          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailCell label="Loai" value={detail.type} />
                            <DetailCell label="Muc do" value={detail.severity} />
                            <DetailCell label="Trang thai" value={detail.status || "Khong co"} />
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

function formatAlertDateTime(value: string | null) {
  return value ? formatDateTime(value) : "Khong co";
}
