import { createContext } from "react";

// Holds `{ user, isLoaded, refresh }` for the whole app. Lives in its own module
// so the provider file can export components only (react-refresh requirement).
export const AuthContext = createContext(null);
