import React, { useState, createContext, useContext, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Role, User } from './types';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// Mock user data - using 'let' to make it mutable for signup
let mockUsers: { [key: string]: User } = {
  'new@test.com': { id: 'user2', email: 'new@test.com', fullName: 'New User', phone: '', role: Role.USER, isVerified: false, createdAt: new Date().toISOString(), totalOrders: 0 },
  'user@test.com': { id: 'user1', email: 'user@test.com', fullName: 'John Doe', phone: '123456789', role: Role.USER, isVerified: true, createdAt: new Date().toISOString(), totalOrders: 4 },
  'proc@test.com': { id: 'proc1', email: 'proc@test.com', fullName: 'Jane Smith', phone: '987654321', role: Role.ORDER_PROCESSOR, isVerified: true, createdAt: new Date().toISOString(), totalOrders: 0 },
  'admin@test.com': { id: 'admin1', email: 'admin@test.com', fullName: 'Admin Power', phone: '555555555', role: Role.ADMIN, isVerified: true, createdAt: new Date().toISOString(), totalOrders: 0 },
  'super@test.com': { id: 'super1', email: 'super@test.com', fullName: 'Super User', phone: '000000000', role: Role.SUPER_ADMIN, isVerified: true, createdAt: new Date().toISOString(), totalOrders: 0 },
};

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  signup: (fullName: string, email: string, phone: string, password?: string) => void;
  signInWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = (email: string) => {
    if (mockUsers[email]) {
      setUser(mockUsers[email]);
      navigate('/dashboard');
    } else {
      alert('User not found. Try one of the mock emails or sign up.');
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };
  
  const signup = (fullName: string, email: string, phone: string, password?: string) => {
    if (mockUsers[email]) {
      alert('An account with this email already exists. Please log in.');
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      phone,
      role: Role.USER,
      isVerified: false,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
    };
    mockUsers[email] = newUser;
    setUser(newUser);
    navigate('/dashboard');
  };

  const signInWithGoogle = () => {
    // This is a mock implementation of Google OAuth
    const googleUser = {
      email: 'google.user@test.com',
      fullName: 'Google User',
      phone: '+1 555-123-4567'
    };

    if (mockUsers[googleUser.email]) {
      // If the user already exists, just log them in
      setUser(mockUsers[googleUser.email]);
    } else {
      // If it's a new user, create their account first
      const newUser: User = {
        id: `user-google-${Date.now()}`,
        email: googleUser.email,
        fullName: googleUser.fullName,
        phone: googleUser.phone,
        role: Role.USER,
        isVerified: false,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
      };
      mockUsers[googleUser.email] = newUser;
      setUser(newUser);
    }
    navigate('/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

const AppRoutes: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={user ? <DashboardPage user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
            <Route path="/" element={!user ? <HomePage /> : <Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;