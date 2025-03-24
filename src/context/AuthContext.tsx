
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';

// Mock users for authentication
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user'
  }
];

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if token exists in localStorage on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Decode the token to get the user data (mock implementation)
          const userData = JSON.parse(localStorage.getItem('auth_user') || '');
          if (userData) {
            // Check if token is expired
            const tokenExpiry = localStorage.getItem('auth_token_expiry');
            if (tokenExpiry && new Date(tokenExpiry) > new Date()) {
              setUser(userData);
            } else {
              // Token expired
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              localStorage.removeItem('auth_token_expiry');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing auth data', error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email and password
      const user = mockUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (user) {
        // Generate mock token
        const token = `mock-jwt-token-${Date.now()}`;
        const { password: _, ...userWithoutPassword } = user;
        
        // Store in localStorage if 'remember me' is checked
        if (remember) {
          // Set token expiry to 7 days
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 7);
          
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
          localStorage.setItem('auth_token_expiry', expiry.toISOString());
        } else {
          // Session storage (clears when browser is closed)
          sessionStorage.setItem('auth_token', token);
          sessionStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
        }
        
        setUser(userWithoutPassword);
        return true;
      } else {
        setError('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove auth data from storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_expiry');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
