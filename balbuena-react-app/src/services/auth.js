const STORAGE_KEY = 'enrollsys_auth_v1';

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

  login({ email }) {
    const user = {
      id: 1,
      name: 'Registrar Admin',
      email: email?.trim() || 'admin@school.edu',
      role: 'Registrar',
    };

    // Mock token; replace with Laravel Sanctum/JWT later.
    writeAuth({ token: 'mock-token', user });
    return user;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

