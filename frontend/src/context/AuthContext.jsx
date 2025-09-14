import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import api from '../services/api';

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

  const login = async (email, password, redirectPath) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Make the login request
      const response = await authApi.login({ email, password });
      
      if (response?.data?.access_token) {
        // Save the token from login response
        const { access_token } = response.data;
        
        // Store the token in localStorage
        localStorage.setItem('token', access_token);
        
        // Update axios default headers with the new token
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        try {
          // Get user details using the token
          const userResponse = await authApi.getMe();
          
          if (userResponse?.data) {
            const user = userResponse.data;
            const userRole = user.role?.toLowerCase() || 'student';
            
            setState({
              user: user,
              loading: false,
              isAuthenticated: true,
              isAdmin: userRole === 'admin',
              isTeacher: userRole === 'teacher',
              isStudent: userRole === 'student',
              error: null,
            });
            
            return { 
              success: true,
              message: 'Login successful!',
              user: user
            };
          }
          
          // If we couldn't get user details but have a token, still consider it a success
          return { 
            success: true,
            message: 'Login successful! Loading your profile...' 
          };
          
        } catch (meError) {
          console.error('Error fetching user details after login:', meError);
          // Even if we can't get user details, the login was successful
          // The user can refresh the page to try again
          return { 
            success: true,
            message: 'Login successful! Loading your profile...' 
          };
        }
      }
      
      // If we get here, something went wrong with the login
      const errorMessage = 'Login failed. No access token received.';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage 
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(err => 
              typeof err === 'object' ? (err.msg || JSON.stringify(err)) : String(err)
            ).join(', ');
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }; // <-- Added missing closing brace and semicolon

  const value = {
    ...state,
    login,
  };

  const register = async (userData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Make the registration request
      const response = await authApi.register(userData);
      
      if (response?.data?.access_token) {
        // Save the token from registration response
        const { access_token } = response.data;
        
        // Store the token in localStorage
        localStorage.setItem('token', access_token);
        
        // Update axios default headers with the new token
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        try {
          // Get user details using the token
          const userResponse = await authApi.getMe();
          
          if (userResponse?.data) {
            const user = userResponse.data;
            const userRole = user.role?.toLowerCase() || 'student';
            
            setState({
              user: user,
              loading: false,
              isAuthenticated: true,
              isAdmin: userRole === 'admin',
              isTeacher: userRole === 'teacher',
              isStudent: userRole === 'student',
              error: null,
            });
            
            return { 
              success: true,
              message: 'Registration successful! Redirecting...',
              user: user
            };
          }
          
          // If we couldn't get user details but have a token, still consider it a success
          return { 
            success: true,
            message: 'Registration successful! Please log in with your credentials.'
          };
          
        } catch (meError) {
          console.error('Error fetching user details after registration:', meError);
          // Even if we can't get user details, the registration was successful
          // The user can log in manually
          return { 
            success: true,
            message: 'Registration successful! Please log in with your credentials.'
          };
        }
      }
      
      // If we get here, something went wrong with the registration
      const errorMessage = response?.data?.detail || 'Registration failed. Please try again.';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(err => 
              typeof err === 'object' ? (err.msg || JSON.stringify(err)) : String(err)
            ).join(', ');
          }
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your input.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error during registration. Please try again later.';
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage 
      };
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
