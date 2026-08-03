// src/screens/AccountScreen.tsx
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { fetchMyAccount, type AccountResponse } from "../api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StateMessage } from "../components/common/StateMessage";
import type { Screen } from "../types";

export function AccountScreen({ onNav }: { onNav: (screen: Screen) => void }) {
  const [account, setAccount] = useState<AccountResponse["account"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { account } = await fetchMyAccount();
        setAccount(account);
      } catch {
        setError("Failed to load account information.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout screen="account" onNav={onNav} title="Account" subtitle="Your profile information">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="animate-spin text-primary" size={48} />
        </div>
      ) : error ? (
        <StateMessage tone="error" title="Error" message={error} />
      ) : account ? (
        <div className="space-y-4 p-4">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-foreground">Profile</h2>
            <p className="text-muted-foreground"><strong>Fullname:</strong> {account.full_name}</p>
            <p className="text-muted-foreground"><strong>Role:</strong> {account.user?.role}</p>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
