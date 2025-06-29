import React, { useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, roles, requireOwnership = false }) => {
  const { user, canAccessUser } = useContext(AuthContext);
  const { userId } = useParams();

  if (!user) return <Navigate to="/login" />;
  
  // Kiểm tra role cơ bản
  if (roles && !roles.includes(user.role))
    return <Navigate to="/unauthorized" />;
  
  // Kiểm tra quyền truy cập cụ thể cho userId (nếu có)
  if (userId && !canAccessUser(parseInt(userId)))
    return <Navigate to="/unauthorized" />;
  
  return children;
};

export default PrivateRoute;
