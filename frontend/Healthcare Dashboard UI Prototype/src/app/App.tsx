import { useState } from "react";
import type { Screen } from "./types";
import { AlertHistoryScreen } from "./screens/AlertHistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { GpsScreen, SettingsScreen, SosScreen } from "./screens/PlaceholderRoutes";

const dashboardScreens: Record<Exclude<Screen, "login">, (props: { onNav: (screen: Screen) => void }) => JSX.Element> = {
  home: HomeScreen,
  alerts: AlertHistoryScreen,
  sos: SosScreen,
  settings: SettingsScreen,
  gps: GpsScreen,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  if (screen === "login") {
    return (
      <div className="w-full h-screen overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <LoginScreen onLogin={() => setScreen("home")} />
      </div>
    );
  }

  const ScreenComponent = dashboardScreens[screen];

  return (
    <div className="w-full h-screen overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <ScreenComponent onNav={setScreen} />
    </div>
  );
}
