import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { screenPaths, type Screen } from "./types";
import { AlertHistoryScreen } from "./screens/AlertHistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PatientListScreen } from "./screens/PatientListScreen";
import { GpsScreen } from "./screens/GpsScreen";
import { RoleProvider } from "./contexts/RoleContext";
import { PatientOnly, PatientOverviewRoute, PatientAlertsRoute, PatientGpsRoute } from "./lib/helper";

function AppRoutes() {
  const navigate = useNavigate();
  const navigateToScreen = (screen: Screen) => navigate(screenPaths[screen]);

  return (
    <Routes>
      <Route path={screenPaths["login"]} element={<LoginScreen />} />
      <Route path={screenPaths["home"]} element={<PatientOnly><HomeScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths["alerts"]} element={<PatientOnly><AlertHistoryScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths["patients"]} element={<PatientListScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths["gps"]} element={<PatientOnly><GpsScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths["settings"]} element={<PatientOnly><SettingsScreen onNav={navigateToScreen} /></PatientOnly>} />
      <Route path={screenPaths["patient-overview"]} element={<PatientOverviewRoute onNav={navigateToScreen} />} />
      <Route path={screenPaths["patient-alerts"]} element={<PatientAlertsRoute onNav={navigateToScreen} />} />
      <Route path={screenPaths["patient-gps"]} element={<PatientGpsRoute onNav={navigateToScreen} />} />
      <Route path="/" element={<LoginScreen />} />
      <Route path="*" element={<HomeScreen onNav={navigateToScreen}/>} />
    </Routes>
  );
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
