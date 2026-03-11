import api from "./api";

const STORAGE_KEY = "enrollsys_auth_v1";

/*
|--------------------------------------------------------------------------
| Storage Helpers
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Auth Service
|--------------------------------------------------------------------------
*/

export const auth = {

  /*
  |--------------------------------------------------------------------------
  | Check if user is logged in
  |--------------------------------------------------------------------------
  */
  isAuthenticated() {
    const data = readAuth();
    return Boolean(data?.token);
  },

  /*
  |--------------------------------------------------------------------------
  | Get current user
  |--------------------------------------------------------------------------
  */
  getUser() {
    return readAuth()?.user ?? null;
  },

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */
  async login({ email, password, role }) {

    const payload = {
      email,
      password,
      device_name: "react",
    };

    // include role only if backend expects it
    if (role) payload.role = role;

    const res = await api.post("/login", payload);

    const data = res.data;

    writeAuth({
      token: data.token,
      user: data.user
    });

    // store raw token (for axios interceptor)
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data.user;
  },

  /*
  |--------------------------------------------------------------------------
  | Register Student
  |--------------------------------------------------------------------------
  */
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

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data.user;
  },

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */
  async logout() {

    try {
      await api.post("/logout");
    } catch (error) {
      console.warn("Logout API failed, clearing local session anyway.");
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("token");
  }

};