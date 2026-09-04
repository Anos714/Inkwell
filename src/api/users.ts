const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export interface GoogleAuthPayload {
  code: string;
  [key: string]: any;
}

export const usersApi = {
  async refresh() {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    return response.json();
  },

  async getMe() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to logout");
    }
    return response.json();
  },

  async googleAuth(payload: GoogleAuthPayload) {
    const response = await fetch(`${API_BASE_URL}/users/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Google authentication failed");
    }
    return response.json();
  },
};
