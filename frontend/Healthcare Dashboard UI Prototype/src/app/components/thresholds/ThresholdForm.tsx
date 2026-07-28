import { useEffect, useState, type MouseEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import type {
  PersonalThresholdSettings,
  PersonalThresholds,
  PersonalThresholdUpdate,
} from "../../api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type ThresholdField = keyof PersonalThresholdUpdate;
type FieldErrors = Partial<Record<ThresholdField, string>>;
type DraftValues = Record<ThresholdField, string>;

const fields: {
  name: ThresholdField;
  label: string;
  unit: string;
  metric: keyof PersonalThresholdSettings["limits"];
}[] = [
  { name: "heartRateMin", label: "Nhip tim toi thieu", unit: "bpm", metric: "heartRate" },
  { name: "heartRateMax", label: "Nhip tim toi da", unit: "bpm", metric: "heartRate" },
  { name: "spo2Min", label: "SpO2 toi thieu", unit: "%", metric: "spo2" },
  { name: "spo2Max", label: "SpO2 toi da", unit: "%", metric: "spo2" },
];

export function ThresholdForm({
  thresholds,
  limits,
  serverErrors,
  saving,
  onFieldEdit,
  onSave,
}: {
  thresholds: PersonalThresholds;
  limits: PersonalThresholdSettings["limits"];
  serverErrors: FieldErrors;
  saving: boolean;
  onFieldEdit: (field: ThresholdField) => void;
  onSave: (values: PersonalThresholdUpdate) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<DraftValues>(() => toDraft(thresholds));
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const [pendingUpdate, setPendingUpdate] = useState<PersonalThresholdUpdate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setDraft(toDraft(thresholds));
    setLocalErrors({});
  }, [thresholds]);

  const requestSave = () => {
    const validation = validateDraft(draft, limits);
    setLocalErrors(validation.errors);

    if (!validation.values) return;

    setPendingUpdate(validation.values);
    setConfirmOpen(true);
  };

  const confirmSave = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!pendingUpdate) return;

    const succeeded = await onSave(pendingUpdate);
    if (succeeded) {
      setConfirmOpen(false);
      setPendingUpdate(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">Dieu chinh nguong</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhap gia tri trong gioi han cau hinh cua he thong. Gia tri toi thieu phai nho hon gia tri toi da.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fields.map((field) => {
            const error = localErrors[field.name] || serverErrors[field.name];
            const fieldLimits = limits[field.metric];
            const errorId = `${field.name}-error`;
            const hintId = `${field.name}-hint`;

            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-foreground">
                  {field.label}
                </label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={draft[field.name]}
                    disabled={saving}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : hintId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDraft((current) => ({ ...current, [field.name]: value }));
                      setLocalErrors((current) => ({ ...current, [field.name]: undefined }));
                      onFieldEdit(field.name);
                    }}
                    className="h-12 pr-14 text-base"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                    {field.unit}
                  </span>
                </div>
                {error ? (
                  <p id={errorId} className="mt-1.5 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : (
                  <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
                    Gioi han he thong: {fieldLimits.min} - {fieldLimits.max} {field.unit}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            size="lg"
            disabled={saving}
            onClick={requestSave}
            className="min-h-12 w-full sm:w-auto"
          >
            {saving ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {saving ? "Dang luu..." : "Luu thay doi"}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !saving && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xac nhan luu nguong?</AlertDialogTitle>
            <AlertDialogDescription>
              He thong se ap dung bon gia tri vua nhap cho benh nhan dang duoc quan ly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} className="min-h-12">
              Huy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={confirmSave}
              className="min-h-12"
            >
              {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {saving ? "Dang luu..." : "Xac nhan luu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function toDraft(thresholds: PersonalThresholds): DraftValues {
  return {
    heartRateMin: String(thresholds.heartRateMin),
    heartRateMax: String(thresholds.heartRateMax),
    spo2Min: String(thresholds.spo2Min),
    spo2Max: String(thresholds.spo2Max),
  };
}

function validateDraft(
  draft: DraftValues,
  limits: PersonalThresholdSettings["limits"],
): { values?: PersonalThresholdUpdate; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const parsed = {} as PersonalThresholdUpdate;

  for (const field of fields) {
    const rawValue = draft[field.name].trim();
    const value = Number(rawValue);
    const fieldLimits = limits[field.metric];

    if (!rawValue || !Number.isFinite(value)) {
      errors[field.name] = "Vui long nhap mot so hop le.";
      continue;
    }
    if (value < fieldLimits.min || value > fieldLimits.max) {
      errors[field.name] = `Gia tri phai tu ${fieldLimits.min} den ${fieldLimits.max}.`;
      continue;
    }

    parsed[field.name] = value;
  }

  if (
    !errors.heartRateMin
    && !errors.heartRateMax
    && parsed.heartRateMin >= parsed.heartRateMax
  ) {
    errors.heartRateMin = "Gia tri toi thieu phai nho hon toi da.";
    errors.heartRateMax = "Gia tri toi da phai lon hon toi thieu.";
  }

  if (!errors.spo2Min && !errors.spo2Max && parsed.spo2Min >= parsed.spo2Max) {
    errors.spo2Min = "Gia tri toi thieu phai nho hon toi da.";
    errors.spo2Max = "Gia tri toi da phai lon hon toi thieu.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { values: parsed, errors };
}
