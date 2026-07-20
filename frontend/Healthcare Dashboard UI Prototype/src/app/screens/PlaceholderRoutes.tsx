import type { Screen } from "../types";
import { PlaceholderScreen } from "../components/common/PlaceholderScreen";

export function SosScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  return (
    <PlaceholderScreen
      screen="sos"
      onNav={onNav}
      title="SOS"
      useCase="UC5"
      requirements={["FR6", "FR7"]}
      modulePath="backend/src/modules/sos"
      todo="Nhan tin hieu nhan giu nut SOS tu thiet bi, ghi su kien va kich hoat luong canh bao."
    />
  );
}

export function SettingsScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  return (
    <PlaceholderScreen
      screen="settings"
      onNav={onNav}
      title="Cai dat nguong ca nhan"
      useCase="UC7"
      requirements={["FR9", "FR10", "FR11"]}
      modulePath="backend/src/modules/personal-thresholds"
      todo="Them form cap nhat nguong, validation va API luu/restore nguong ca nhan."
    />
  );
}

export function GpsScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  return (
    <PlaceholderScreen
      screen="gps"
      onNav={onNav}
      title="Vi tri benh nhan"
      useCase="UC6"
      requirements={["FR8"]}
      modulePath="backend/src/modules/patient-location"
      todo="Tich hop du lieu GPS that, kiem tra quyen xem va hien thi ban do/vi tri moi nhat."
    />
  );
}
