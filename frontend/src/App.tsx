import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router";
import { screenPaths, type Screen } from "./types";
import { AlertHistoryScreen } from "./screens/AlertHistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PatientListScreen } from "./screens/PatientListScreen";
import { GpsScreen } from "./screens/GpsScreen";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import type { ReactNode } from "react";

function AppRoutes() {
  const navigate = useNavigate();
  const navigateToScreen = (screen: Screen) => navigate(screenPaths[screen]);

  return (
    <Routes>
      <Route path={screenPaths.login} element={<LoginScreen />} />
      <Route path={screenPaths.home} element={<PatientOnly><HomeScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths.alerts} element={<PatientOnly><AlertHistoryScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths.patients} element={<PatientListScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths.gps} element={<PatientOnly><GpsScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths.settings} element={<PatientOnly><SettingsScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path="/patients/:patientId/overview" element={<PatientOverviewRoute onNav={navigateToScreen} />} />
      <Route path="/patients/:patientId/alerts" element={<PatientAlertsRoute onNav={navigateToScreen} />} />
      <Route path="/patients/:patientId/gps" element={<PatientGpsRoute onNav={navigateToScreen} />} />
      <Route path="/" element={<LoginScreen />} />
      <Route path="*" element={<LoginScreen />} />
    </Routes>
  );
}

function PatientOnly({ children }: { children: ReactNode }) {
  const { role } = useRole();
  return role === "caregiver" ? <Navigate to={screenPaths.patients} replace /> : children;
}

function RoleLanding() {
  const { role } = useRole();
  return <Navigate to={role === "caregiver" ? screenPaths.patients : screenPaths.home} replace />;
}

function PatientOverviewRoute({ onNav }: { onNav: (screen: Screen) => void }) {
  const { patientId } = useParams();
  return patientId ? <HomeScreen onNav={onNav} patientId={patientId} /> : <Navigate to={screenPaths.patients} replace />;
}

function PatientAlertsRoute({ onNav }: { onNav: (screen: Screen) => void }) {
  const { patientId } = useParams();
  return patientId ? <AlertHistoryScreen onNav={onNav} patientId={patientId} /> : <Navigate to={screenPaths.patients} replace />;
}

function PatientGpsRoute({ onNav }: { onNav: (screen: Screen) => void }) {
  const { patientId } = useParams();
  return patientId ? <GpsScreen onNav={onNav} patientId={patientId} /> : <Navigate to={screenPaths.patients} replace />;
}

export default function App() {
  return (
    <RoleProvider>
      <div className="h-dvh min-h-[32rem] w-full overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </div>
    </RoleProvider>
  );
}
