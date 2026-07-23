import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router";
import { authAdapter, type LoginCredentials } from "./adapters/authAdapter";
import { screenPaths, type Screen } from "./types";
import { AlertHistoryScreen } from "./screens/AlertHistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { GpsScreen, SosScreen } from "./screens/PlaceholderRoutes";
import { SettingsScreen } from "./screens/SettingsScreen";

function AppRoutes() {
  const navigate = useNavigate();
  const navigateToScreen = (screen: Screen) => navigate(screenPaths[screen]);
  const handleLogin = async (credentials: LoginCredentials) => {
    await authAdapter.login(credentials);
    navigate(screenPaths.home, { replace: true });
  };

  return (
    <Routes>
      <Route path={screenPaths.login} element={<LoginScreen onLogin={handleLogin} />} />
      <Route path={screenPaths.home} element={<HomeScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths.alerts} element={<AlertHistoryScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths.sos} element={<SosScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths.gps} element={<GpsScreen onNav={navigateToScreen} />} />
      <Route path={screenPaths.settings} element={<SettingsScreen onNav={navigateToScreen} />} />
      <Route path="/" element={<Navigate to={screenPaths.login} replace />} />
      <Route path="*" element={<Navigate to={screenPaths.login} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="h-dvh min-h-[32rem] w-full overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}
