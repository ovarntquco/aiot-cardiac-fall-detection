// src/contexts/RoleContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchMyAccount } from "../api";

type Role = "caregiver" | "patient" | null;

interface RoleContextProps {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const savedRole = localStorage.getItem("user_role");
    return savedRole === "caregiver" || savedRole === "patient" ? savedRole : null;
  });

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    if (nextRole) localStorage.setItem("user_role", nextRole);
    else localStorage.removeItem("user_role");
  };

  useEffect(() => {
    if (!localStorage.getItem("sessionToken")) return;

    void fetchMyAccount()
      .then(({ account }) => setRole(account.user?.role ?? null))
      .catch(() => {
        // Individual screens surface authentication and network errors.
      });
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
  );
};

export const useRole = (): RoleContextProps => {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
};
