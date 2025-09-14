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
    error: null,
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
          error: error.message || 'Authentication failed',
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authApi.login({ email, password });
      
      if (!response?.data?.access_token) {
        throw new Error('No access token received from server');
      }
      
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Get user data using the token
      const userResponse = await authApi.getMe();
      const userData = userResponse.data;
      
      setState({
        user: userData,
        loading: false,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin',
        isTeacher: userData.role === 'teacher',
        isStudent: userData.role === 'student',
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: { 
          message: errorMessage, 
          code: error.response?.status || 500 
        }
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    login,
  };

  const register = async (userData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authApi.register(userData);
      
      if (response?.data?.access_token) {
        // Save the token from registration response
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        
        // Set the default authorization header
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user details
        const userResponse = await authApi.getMe();;
        
        setState({
          user: userResponse.data,
          loading: false,
          isAuthenticated: true,
          isAdmin: userResponse.data.role === 'admin',
          isTeacher: userResponse.data.role === 'teacher',
          isStudent: userResponse.data.role === 'student',
          error: null,
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed - no token received' };
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
    try {
      localStorage.removeItem('token');
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        error: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      setState(prev => ({
        ...prev,
        error: { message: 'Error during logout', code: 500 },
      }));
    }
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
