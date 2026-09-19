const TOKEN_KEY = "halal_mart_token";
const ADMIN_KEY = "halal_mart_admin";

// Save login
export const saveAuth = (token, admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

// Get token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get logged-in admin
export const getAdmin = () => {
  const admin = localStorage.getItem(ADMIN_KEY);

  if (!admin) {
    return null;
  }

  try {
    return JSON.parse(admin);
  } catch (error) {
    console.error("Failed to parse admin data:", error);
    return null;
  }
};

// Check authentication
export const isAuthenticated = () => {
  return Boolean(getToken());
};

// Logout
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};