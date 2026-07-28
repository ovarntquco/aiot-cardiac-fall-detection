import { useEffect, useState, type MouseEvent } from "react";
import { Activity, Heart, LoaderCircle, RefreshCcw, RotateCcw } from "lucide-react";
import {
  ApiError,
  fetchPersonalThresholds,
  restoreDefaultThresholds,
  updatePersonalThresholds,
  type PersonalThresholdSettings,
  type PersonalThresholdUpdate,
} from "../api";
import type { Screen } from "../types";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ThresholdCard } from "../components/metrics/ThresholdCard";
import { ThresholdForm } from "../components/thresholds/ThresholdForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";

type Feedback = {
  tone: "info" | "error";
  title: string;
  message: string;
};

export function SettingsScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [settings, setSettings] = useState<PersonalThresholdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setLoadError(null);
    setFeedback(null);

    try {
      setSettings(await fetchPersonalThresholds());
    } catch (error) {
      setSettings(null);
      setLoadError(toMessage(error, "Khong the tai nguong ca nhan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveThresholds = async (values: PersonalThresholdUpdate) => {
    setSaving(true);
    setServerErrors({});
    setFeedback(null);

    try {
      const persisted = await updatePersonalThresholds(values);
      setSettings(persisted);
      setFeedback({
        tone: "info",
        title: "Da luu nguong",
        message: "Bon gia tri nguong da duoc backend xac nhan va ap dung.",
      });
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setServerErrors(error.fieldErrors);
      }
      setFeedback({
        tone: "error",
        title: "Khong the luu nguong",
        message: `${toMessage(error, "May chu tu choi cap nhat.")} Gia tri dang ap dung khong thay doi.`,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const confirmRestore = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setRestoring(true);
    setServerErrors({});
    setFeedback(null);

    try {
      const persisted = await restoreDefaultThresholds();
      setSettings(persisted);
      setRestoreOpen(false);
      setFeedback({
        tone: "info",
        title: "Da khoi phuc mac dinh",
        message: "Cac gia tri cau hinh mac dinh cua he thong da duoc backend ap dung.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        title: "Khong the khoi phuc",
        message: `${toMessage(error, "May chu tu choi khoi phuc.")} Gia tri dang ap dung khong thay doi.`,
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <DashboardLayout
      screen="settings"
      onNav={onNav}
      title="Cai dat"
      subtitle="Hieu chinh nguong ca nhan"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Nguong theo doi dang ap dung</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chi tai khoan nguoi giam ho duoc uy quyen moi co the thay doi cac gia tri nay.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={loading || saving || restoring}
            onClick={() => void loadSettings()}
            className="min-h-12 self-start sm:self-auto"
          >
            <RefreshCcw className={loading ? "animate-spin" : ""} aria-hidden="true" />
            {loading ? "Dang tai..." : "Tai lai"}
          </Button>
        </div>

        {loading && (
          <StateMessage
            title="Dang tai nguong ca nhan"
            message="Dang lay gia tri hien tai va gioi han cau hinh tu backend."
          />
        )}
        {!loading && loadError && (
          <StateMessage
            title="Khong the tai cai dat"
            message={loadError}
            tone="error"
            actionLabel="Thu lai"
            onAction={() => void loadSettings()}
          />
        )}
        {!loading && !loadError && !settings && (
          <StateMessage
            title="Chua co du lieu nguong"
            message="Backend chua tra ve cau hinh nguong cho benh nhan dang quan ly."
            tone="empty"
            actionLabel="Tai lai"
            onAction={() => void loadSettings()}
          />
        )}

        {!loading && !loadError && settings && (
          <div className="space-y-6">
            {feedback && (
              <StateMessage
                compact
                title={feedback.title}
                message={feedback.message}
                tone={feedback.tone}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Nguong hien tai dang ap dung">
              <ThresholdCard
                icon={<Heart size={14} className="text-red-500" />}
                title="Nguong nhip tim"
                values={[
                  { label: "Toi thieu", value: settings.thresholds.heartRateMin, unit: "bpm" },
                  { label: "Toi da", value: settings.thresholds.heartRateMax, unit: "bpm" },
                ]}
              />
              <ThresholdCard
                icon={<Activity size={14} className="text-primary" />}
                title="Nguong SpO2"
                values={[
                  { label: "Toi thieu", value: settings.thresholds.spo2Min, unit: "%" },
                  { label: "Toi da", value: settings.thresholds.spo2Max, unit: "%" },
                ]}
              />
            </div>

            <ThresholdForm
              thresholds={settings.thresholds}
              limits={settings.limits}
              serverErrors={serverErrors}
              saving={saving}
              onFieldEdit={() => setServerErrors({})}
              onSave={saveThresholds}
            />

            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Khoi phuc cau hinh mac dinh</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Day la gia tri mac dinh co the thay doi trong cau hinh he thong, khong phai loi khuyen y te.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || restoring}
                  onClick={() => setRestoreOpen(true)}
                  className="min-h-12 w-full sm:w-auto"
                >
                  <RotateCcw aria-hidden="true" />
                  Khoi phuc mac dinh
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={restoreOpen} onOpenChange={(open) => !restoring && setRestoreOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khoi phuc nguong mac dinh?</AlertDialogTitle>
            <AlertDialogDescription>
              Bon gia tri dang ap dung se duoc thay bang cau hinh mac dinh cua he thong. Cac gia tri nay khong phai loi khuyen y te.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring} className="min-h-12">
              Huy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={restoring}
              onClick={confirmRestore}
              className="min-h-12"
            >
              {restoring && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {restoring ? "Dang khoi phuc..." : "Xac nhan khoi phuc"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
