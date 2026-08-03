import { useEffect, useState } from "react";
import { fetchOverview, type OverviewResponse } from "../api";
import type { Screen } from "../types";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function PatientOverviewScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverview();
      setOverview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout screen="patient-overview" onNav={onNav} title="Patient Overview" subtitle="API Debug View">
        <StateMessage title="Loading" message="Fetching patient overview..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout screen="patient-overview" onNav={onNav} title="Patient Overview" subtitle="API Debug View">
        <StateMessage
          title="Failed to load overview"
          message={error}
          tone="error"
          actionLabel="Retry"
          onAction={() => void load()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout screen="patient-overview" onNav={onNav} title="Patient Overview" subtitle="API Debug View">
      <pre style={{ overflow: "auto", maxHeight: "70vh" }}>{JSON.stringify(overview, null, 2)}</pre>
    </DashboardLayout>
  );
}
