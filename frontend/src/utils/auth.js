// Auth token management
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

// User session management
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

// Role-based access control
export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const isAdmin = () => {
  return hasRole('admin');
};

// Login/Logout - removed to avoid circular imports
// Login logic is handled in AuthContext

export const logout = () => {
  removeToken();
  setUser(null);
  window.location.href = '/login';
};

// Protected route wrapper
export const withAuth = (Component) => {
  return (props) => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return null;
    }
    return <Component {...props} />;
  };
};

export const withAdminAuth = (Component) => {
  return (props) => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return null;
    }
    if (!isAdmin()) {
      window.location.href = '/unauthorized';
      return null;
    }
    return <Component {...props} />;
  };
};
