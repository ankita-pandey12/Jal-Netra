import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (email, password) => {
        // Domain restriction logic
        const allowedDomains = ["@nagpur.gov.in", "@maharashtra.gov.in"];
        const isAllowed = allowedDomains.some(domain => email.endsWith(domain));

        if (isAllowed) {
            setUser({ email });
            return { success: true };
        } else {
            return {
                success: false,
                message: "Access Denied. Only @nagpur.gov.in or @maharashtra.gov.in domains allowed."
            };
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
