import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('full_name');
    if (token) {
      setUser({ token, role, fullName });
    }
    setLoading(false);
  }, []);

  const login = (token, role, fullName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('full_name', fullName);
    setUser({ token, role, fullName });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);