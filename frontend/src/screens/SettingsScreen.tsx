import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  LoaderCircle,
  RefreshCcw,
  Ruler,
  Scale,
  UserRound,
} from "lucide-react";
import { fetchMyAccount, type AccountResponse } from "../api";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import type { Screen } from "../types";

type Account = AccountResponse["account"];

export function SettingsScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRole } = useRole();

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMyAccount();
      setAccount(response.account);
      setRole(response.account.user?.role ?? null);
    } catch (loadError) {
      setAccount(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load account information.");
    } finally {
      setLoading(false);
    }
  }, [setRole]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  return (
    <DashboardLayout
      screen="settings"
      onNav={onNav}
      title="Settings"
      subtitle="Account and personal information"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Your Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Information associated with your signed-in account.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => void loadAccount()}
            className="min-h-12"
          >
            <RefreshCcw className={loading ? "animate-spin" : ""} aria-hidden="true" />
            <span className="hidden sm:inline">{loading ? "Loading..." : "Reload"}</span>
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
            <LoaderCircle className="animate-spin text-primary" size={40} aria-label="Loading account" />
          </div>
        )}

        {!loading && error && (
          <StateMessage
            tone="error"
            title="Failed to load account"
            message={error}
            actionLabel="Retry"
            onAction={() => void loadAccount()}
          />
        )}

        {!loading && !error && account && (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-5 border-b border-border bg-gradient-to-r from-secondary/80 to-white p-6 sm:p-8">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <UserRound className="text-primary-foreground" size={28} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-foreground">
                  {displayValue(account.full_name)}
                </h2>
                <p className="mt-1 text-sm capitalize text-muted-foreground">
                  {displayValue(account.user?.role)}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2">
              <InfoRow label="Full name" value={account.full_name} icon={<UserRound size={18} />} />
              <InfoRow label="Role" value={account.user?.role} capitalize icon={<UserRound size={18} />} />
              <InfoRow label="Date of birth" value={formatDate(account.date_of_birth)} icon={<CalendarDays size={18} />} />
              <InfoRow label="Sex" value={account.sex} capitalize icon={<UserRound size={18} />} />
              <InfoRow label="Height" value={withUnit(account.height, "cm")} icon={<Ruler size={18} />} />
              <InfoRow label="Weight" value={withUnit(account.weight, "kg")} icon={<Scale size={18} />} />
            </dl>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoRow({
  label,
  value,
  icon,
  capitalize = false,
}: {
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div className="flex gap-4 border-b border-border p-6 transition-colors hover:bg-slate-50 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true">{icon}</span>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className={`mt-1 text-sm font-semibold text-foreground ${capitalize ? "capitalize" : ""}`}>
          {displayValue(value)}
        </dd>
      </div>
    </div>
  );
}

function displayValue(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Not provided" : String(value);
}

function withUnit(value: number | null | undefined, unit: string) {
  return value === undefined || value === null ? undefined : `${value} ${unit}`;
}

function formatDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}
