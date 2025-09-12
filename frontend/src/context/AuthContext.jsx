import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const response = await authApi.getMe();
        if (response.data) {
          setState({
            user: response.data,
            loading: false,
            isAuthenticated: true,
            isAdmin: response.data.role === 'admin',
            isTeacher: response.data.role === 'teacher',
            isStudent: response.data.role === 'student',
          });
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        localStorage.removeItem('token');
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
          isTeacher: false,
          isStudent: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await authApi.login(email, password);
      
      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        let userData = response.data.user;
        if (!userData) {
          try {
            const userResponse = await authApi.getMe();
            userData = userResponse.data;
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            return { success: false, error: 'Failed to get user information' };
          }
        }
        
        setState({
          user: userData,
          loading: false,
          isAuthenticated: true,
          isAdmin: userData?.role === 'admin',
          isTeacher: userData?.role === 'teacher',
          isStudent: userData?.role === 'student',
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = 'Invalid login credentials';
        }
      }
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const register = async (userData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await authApi.register(userData);
      
      if (response.data) {
        return await login(userData.email, userData.password);
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = 'Registration failed';
        }
      }
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    });
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.data) {
        setState({
          user: response.data,
          loading: false,
          isAuthenticated: true,
          isAdmin: response.data.role === 'admin',
          isTeacher: response.data.role === 'teacher',
          isStudent: response.data.role === 'student',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {!state.loading ? children : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw'
        }}>
          <div>Loading...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
