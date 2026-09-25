import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [viewRole, setViewRole] = useState(null); // Allows providers to switch view

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined' && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setViewRole(parsedUser.role); // Initialize viewRole based on user's actual role
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        logoutUser();
      }
    }
  }, [token]);

  const loginUser = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    setViewRole(userData.role);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setViewRole(null);
  };

  const toggleViewRole = () => {
    if (user?.role === 'Provider') {
      setViewRole((prev) => (prev === 'Provider' ? 'Customer' : 'Provider'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, viewRole, loginUser, logoutUser, toggleViewRole }}>
      {children}
    </AuthContext.Provider>
  );
};