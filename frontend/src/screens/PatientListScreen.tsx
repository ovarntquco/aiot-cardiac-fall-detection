import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Activity, ChevronRight, HeartPulse, LoaderCircle, Pencil, RefreshCcw, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  fetchPatients,
  updateVitalsThresholds,
  type PatientAccount,
} from "../api";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useRole } from "../contexts/RoleContext";
import { screenPaths, type Screen } from "../types";

type Draft = { hrLow: string; hrHigh: string; spo2Low: string };
type DraftField = keyof Draft;
type FieldErrors = Partial<Record<DraftField, string>>;

const thresholdFields: Array<{
  name: DraftField;
  label: string;
  unit: string;
  min: number;
  max: number;
}> = [
  { name: "hrLow", label: "Low heart rate", unit: "bpm", min: 60, max: 90 },
  { name: "hrHigh", label: "High heart rate", unit: "bpm", min: 100, max: 190 },
  { name: "spo2Low", label: "Low SpO2", unit: "%", min: 80, max: 100 },
];

export function PatientListScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const navigate = useNavigate();
  const { role } = useRole();
  const [patients, setPatients] = useState<PatientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ hrLow: "", hrHigh: "", spo2Low: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await fetchPatients());
    } catch (loadError) {
      setPatients([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "caregiver") void loadPatients();
    else if (role === "patient") setLoading(false);
  }, [loadPatients, role]);

  const beginEditing = (patient: PatientAccount) => {
    setEditingId(patient.id);
    setDraft({
      hrLow: valueToDraft(patient.hr_low),
      hrHigh: valueToDraft(patient.hr_high),
      spo2Low: valueToDraft(patient.spo2_low),
    });
    setFieldErrors({});
    setSaveError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFieldErrors({});
    setSaveError(null);
  };

  const saveThresholds = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    const validation = validateDraft(draft);
    setFieldErrors(validation.errors);
    if (!validation.values) return;

    setSaving(true);
    setSaveError(null);
    try {
      const { patient } = await updateVitalsThresholds(editingId, validation.values);
      setPatients((current) => current.map((item) => (
        item.id === editingId
          ? {
              ...item,
              hr_low: patient.hrLow,
              hr_high: patient.hrHigh,
              spo2_low: patient.spo2Low,
            }
          : item
      )));
      cancelEditing();
    } catch (updateError) {
      setSaveError(updateError instanceof Error ? updateError.message : "Failed to update thresholds.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      screen="patients"
      onNav={onNav}
      title="Patient List"
      subtitle="Patients assigned to your caregiver account"
    >
      <div className="mx-auto max-w-5xl">
        {role === "patient" ? (
          <StateMessage
            tone="error"
            title="Caregiver access required"
            message="Only caregivers can view the patient list and update personal thresholds."
          />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading patients..." : `${patients.length} patient(s)`}
              </p>
              <Button type="button" variant="ghost" disabled={loading} onClick={() => void loadPatients()} className="min-h-12">
                <RefreshCcw className={loading ? "animate-spin" : ""} aria-hidden="true" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {loading && <StateMessage title="Loading patient list" message="Retrieving assigned patients from the API." />}
            {!loading && error && (
              <StateMessage tone="error" title="Failed to load patients" message={error} actionLabel="Retry" onAction={() => void loadPatients()} />
            )}
            {!loading && !error && patients.length === 0 && (
              <StateMessage tone="empty" title="No patients assigned" message="There are no patients connected to this caregiver account." />
            )}

            {!loading && !error && patients.length > 0 && (
              <div className="space-y-4">
                {patients.map((patient) => {
                  const isEditing = editingId === patient.id;
                  return (
                    <article key={patient.id} className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]">
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <button
                          type="button"
                          onClick={() => navigate(`${screenPaths["patient-overview"]}?patientId=${encodeURIComponent(patient.id)}`)}
                          className="flex min-h-16 min-w-0 flex-1 items-center gap-4 rounded-xl p-2.5 text-left transition-colors hover:bg-secondary/70"
                          aria-label={`View ${patient.full_name || "patient"}`}
                        >
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                            <UserRound size={25} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-foreground">{patient.full_name || "Unnamed patient"}</h2>
                            <p className="mt-1.5 text-sm capitalize text-muted-foreground">
                              {[patient.sex, formatDate(patient.date_of_birth)].filter(Boolean).join(" · ") || "No personal details"}
                              </p>
                          </div>
                          <ChevronRight className="ml-auto flex-shrink-0 text-muted-foreground" size={20} aria-hidden="true" />
                        </button>
                        <Button
                          type="button"
                          variant={isEditing ? "ghost" : "outline"}
                          disabled={saving}
                          onClick={() => isEditing ? cancelEditing() : beginEditing(patient)}
                          className="min-h-12 w-full sm:w-auto"
                        >
                          {isEditing ? <X aria-hidden="true" /> : <Pencil aria-hidden="true" />}
                          {isEditing ? "Cancel" : "Update thresholds"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
                        <ThresholdValue icon={<HeartPulse size={17} />} label="Low heart rate" value={patient.hr_low} unit="bpm" />
                        <ThresholdValue icon={<HeartPulse size={17} />} label="High heart rate" value={patient.hr_high} unit="bpm" />
                        <ThresholdValue icon={<Activity size={17} />} label="Low SpO2" value={patient.spo2_low} unit="%" />
                      </div>

                      {isEditing && (
                        <form onSubmit={saveThresholds} className="border-t border-border bg-slate-50/80 p-5 sm:p-7">
                          <h3 className="font-semibold text-foreground">Personal thresholds</h3>
                          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {thresholdFields.map((field) => {
                              const errorId = `${patient.id}-${field.name}-error`;
                              return (
                                <div key={field.name}>
                                  <label htmlFor={`${patient.id}-${field.name}`} className="mb-1.5 block text-sm font-medium text-foreground">
                                    {field.label}
                                  </label>
                                  <div className="relative">
                                    <Input
                                      id={`${patient.id}-${field.name}`}
                                      type="number"
                                      min={field.min}
                                      max={field.max}
                                      step="1"
                                      value={draft[field.name]}
                                      disabled={saving}
                                      aria-invalid={Boolean(fieldErrors[field.name])}
                                      aria-describedby={fieldErrors[field.name] ? errorId : undefined}
                                      onChange={(changeEvent) => {
                                        setDraft((current) => ({ ...current, [field.name]: changeEvent.target.value }));
                                        setFieldErrors((current) => ({ ...current, [field.name]: undefined }));
                                      }}
                                      className="h-12 pr-12"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">{field.unit}</span>
                                  </div>
                                  {fieldErrors[field.name] && <p id={errorId} className="mt-1 text-xs text-destructive">{fieldErrors[field.name]}</p>}
                                  {!fieldErrors[field.name] && <p className="mt-1 text-xs text-muted-foreground">Allowed: {field.min}–{field.max}</p>}
                                </div>
                              );
                            })}
                          </div>
                          {saveError && <div className="mt-4"><StateMessage compact tone="error" title="Update failed" message={saveError} /></div>}
                          <div className="mt-5 flex justify-end">
                            <Button type="submit" disabled={saving} className="min-h-12 w-full sm:w-auto">
                              {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                              {saving ? "Saving..." : "Save thresholds"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function ThresholdValue({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value?: number | null; unit: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="text-primary" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value ?? "Not set"}{value == null ? "" : ` ${unit}`}</p>
      </div>
    </div>
  );
}

function valueToDraft(value?: number | null) {
  return value == null ? "" : String(value);
}

function formatDate(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function validateDraft(draft: Draft): {
  values?: { hrLow: number; hrHigh: number; spo2Low: number };
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const values = {} as { hrLow: number; hrHigh: number; spo2Low: number };

  for (const field of thresholdFields) {
    const value = Number(draft[field.name]);
    if (!draft[field.name].trim() || !Number.isInteger(value)) {
      errors[field.name] = "Enter a whole number.";
    } else if (value < field.min || value > field.max) {
      errors[field.name] = `Must be between ${field.min} and ${field.max}.`;
    } else {
      values[field.name] = value;
    }
  }

  return Object.keys(errors).length ? { errors } : { values, errors };
}
