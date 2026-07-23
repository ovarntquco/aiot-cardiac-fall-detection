import { setSessionToken } from "../api";

export type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  userId: string;
};

type AuthAdapter = {
  login(credentials: LoginCredentials): Promise<void>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const useDevelopmentAdapter = import.meta.env.DEV && import.meta.env.VITE_USE_DEV_AUTH !== "false";

const developmentAuthAdapter: AuthAdapter = {
  async login({ username, password }) {
    if (!username.trim() || !password.trim()) {
      throw new Error("Vui long nhap day du thong tin dang nhap.");
    }

    setSessionToken(import.meta.env.VITE_DEV_AUTH_TOKEN || "dev-caregiver-token");
  },
};

const backendAuthAdapter: AuthAdapter = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const payload = await response.json() as {
      success: boolean;
      data?: LoginResponse;
      error?: { message?: string };
    };

    if (!response.ok || !payload.success || !payload.data?.accessToken) {
      throw new Error(payload.error?.message || "Khong the dang nhap. Vui long thu lai.");
    }

    setSessionToken(payload.data.accessToken);
  },
};

export const authAdapter = useDevelopmentAdapter ? developmentAuthAdapter : backendAuthAdapter;
