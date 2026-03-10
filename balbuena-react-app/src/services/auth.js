import { api } from "./api";

const STORAGE_KEY = "enrollsys_auth_v1";

function readAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeAuth(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const auth = {

  isAuthenticated() {
    const data = readAuth();
    return Boolean(data?.token);
  },

  getUser() {
    return readAuth()?.user ?? null;
  },

  async login({ email, password, role }) {

    const payload = {
      email,
      password,
      device_name: "react",
    };

    // Only include role if your backend expects it
    if (role) payload.role = role;

    const res = await api.post("/login", payload);

    const data = res.data;

    writeAuth({
      token: data.token,
      user: data.user
    });

    // Also store raw token for interceptor simplicity
    if (data?.token) localStorage.setItem("token", data.token);

    return data.user;
  },

  async registerStudent({ name, email, password }) {

    const res = await api.post("/register", {
      name,
      email,
      password
    });

    const data = res.data;

    writeAuth({
      token: data.token,
      user: data.user
    });

    if (data?.token) localStorage.setItem("token", data.token);

    return data.user;
  },

  async logout() {

    await api.post("/logout");

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("token");
  }

};