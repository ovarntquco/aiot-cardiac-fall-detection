import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router";
import { useRole } from "../contexts/RoleContext";
import { AlertHistoryScreen } from "../screens/AlertHistoryScreen";
import { GpsScreen } from "../screens/GpsScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { screenPaths, type Screen } from "../types";

type NavigationProps = {
  onNav: (screen: Screen) => void;
};

type SelectedPatientRouteProps = {
  children: (patientId: string) => ReactNode;
};

export function PatientOnly({ children }: { children: ReactNode }) {
  const { role } = useRole();

  return role === "caregiver"
    ? <Navigate to={screenPaths.patients} replace />
    : children;
}

function SelectedPatientRoute({ children }: SelectedPatientRouteProps) {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  return patientId
    ? children(patientId)
    : <Navigate to={screenPaths.patients} replace />;
}

export function PatientOverviewRoute({ onNav }: NavigationProps) {
  return (
    <SelectedPatientRoute>
      {(patientId) => <HomeScreen onNav={onNav} patientId={patientId} />}
    </SelectedPatientRoute>
  );
}

export function PatientAlertsRoute({ onNav }: NavigationProps) {
  return (
    <SelectedPatientRoute>
      {(patientId) => <AlertHistoryScreen onNav={onNav} patientId={patientId} />}
    </SelectedPatientRoute>
  );
}

export function PatientGpsRoute({ onNav }: NavigationProps) {
  return (
    <SelectedPatientRoute>
      {(patientId) => <GpsScreen onNav={onNav} patientId={patientId} />}
    </SelectedPatientRoute>
  );
}
