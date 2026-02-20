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

  login({ email, password, role = 'admin' }) {
    const trimmedEmail = email?.trim() || (role === 'student' ? 'student@school.edu' : 'admin@school.edu');

    const user =
      role === 'student'
        ? {
            id: 101,
            name: trimmedEmail.split('@')[0].replace(/\./g, ' ') || 'Student User',
            email: trimmedEmail,
            role: 'Student',
          }
        : {
            id: 1,
            name: 'Registrar Admin',
            email: trimmedEmail,
            role: 'Admin',
          };

    // Mock token; ignore password and replace with Laravel auth later.
    writeAuth({ token: 'mock-token', user });
    return user;
  },

  registerStudent({ name, email, password }) {
    const trimmedEmail = email?.trim() || 'student@school.edu';
    const displayName = name?.trim() || trimmedEmail.split('@')[0].replace(/\./g, ' ') || 'Student User';

    const user = {
      id: Date.now(),
      name: displayName,
      email: trimmedEmail,
      role: 'Student',
    };

    // In a real app this would POST to Laravel then store returned token/user.
    writeAuth({ token: 'mock-student-token', user });
    return user;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

