import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ ĐÚNG

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
        setToken(storedToken);
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const login = (newToken, userData = null) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      
      if (userData) {
        // Nếu có userData từ API response, sử dụng nó
        setUser(userData);
      } else {
        // Fallback: decode từ token
        const decoded = jwtDecode(newToken);
        setUser(decoded);
      }
    } catch (error) {
      console.error("Không thể decode token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Utility functions for authorization
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const canAccessUser = (userId) => {
    if (!user) return false;
    
    // SUP có thể truy cập tất cả users
    if (user.role === 'SUP') return true;
    
    // EMPL chỉ có thể truy cập chính mình
    if (user.role === 'EMPL') {
      return user.userId === userId;
    }
    
    // MANA có thể truy cập users trong department của mình
    if (user.role === 'MANA') {
      // Cần implement logic kiểm tra department
      return true; // Tạm thời cho phép, sẽ kiểm tra ở API
    }
    
    return false;
  };

  const canManageDepartment = (departmentId) => {
    if (!user) return false;
    
    // SUP có thể quản lý tất cả departments
    if (user.role === 'SUP') return true;
    
    // Department manager có thể quản lý department của mình
    if (user.role === 'MANA' && user.isDepartmentManager && user.departmentId === departmentId) {
      return true;
    }
    
    return false;
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser: user,
      token,
      login, 
      logout, 
      hasRole, 
      canAccessUser, 
      canManageDepartment, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
