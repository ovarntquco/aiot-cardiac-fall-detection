import { useCallback, useEffect, useState } from "react";
import { BellRing, Clock, RefreshCw } from "lucide-react";
import { fetchAlerts, type AlertSummary } from "../api";
import type { Screen } from "../types";
import { StateMessage } from "../components/common/StateMessage";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { formatDateTime } from "../lib/format";

export function AlertHistoryScreen({ onNav, patientId }: { onNav: (screen: Screen) => void; patientId?: string }) {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchAlerts(patientId);
      setAlerts(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Can not load alert history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  return (
    <DashboardLayout
      screen={patientId ? "patients" : "alerts"}
      onNav={onNav}
      title="Alert History"
      subtitle="All patient alerts retrieved from the database"
      patientId={patientId}
      patientSection={patientId ? "alerts" : undefined}
    >
      <div className="max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading alert list..." : `${alerts.length} alert(s)`}
          </p>
          <button
            type="button"
            onClick={loadAlerts}
            disabled={loading}
            className="flex min-h-12 flex-shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading" : "Refresh"}
          </button>
        </div>

        {loading && <StateMessage title="Loading History" message="Querying the latest alerts." />}
        {error && !loading && (
          <StateMessage
            title="Failed to load alerts"
            message={error}
            tone="error"
            actionLabel="Retry"
            onAction={() => void loadAlerts()}
          />
        )}
        {!loading && !error && alerts.length === 0 && (
          <Alert>
            <AlertTitle>No alerts available</AlertTitle>
            <AlertDescription>The database contains no alerts for this patient.</AlertDescription>
          </Alert>
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="overflow-hidden rounded-2xl border border-border/80 border-l-4 border-l-red-400 bg-card shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex min-h-28 items-center gap-5 px-5 py-6 sm:px-8">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <BellRing size={25} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-foreground">Alert</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={16} aria-hidden="true" />
                      <time dateTime={alert.recordedAt ?? undefined}>
                        {formatAlertDateTime(alert.recordedAt)}
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function formatAlertDateTime(value: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "Time unavailable";
  return formatDateTime(value);
}
