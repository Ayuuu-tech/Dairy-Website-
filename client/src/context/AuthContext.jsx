import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getMe, googleLoginApi } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount (cookie-based)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user);
    return res.data;
  };

  const sendOtp = async (email) => {
    const { sendOtpApi } = await import('../api/auth');
    const res = await sendOtpApi({ email });
    return res.data;
  };

  const loginWithOtp = async (email, otp) => {
    const { verifyOtpApi } = await import('../api/auth');
    const res = await verifyOtpApi({ email, otp });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    setUser(res.data.user);
    return res.data;
  };
  
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Even if API fails, clear local state
    }
    setUser(null);
  };

  const googleLogin = async (credential) => {
    const res = await googleLoginApi({ credential });
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithOtp, sendOtp, register, logout, loading, checkAuth, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
