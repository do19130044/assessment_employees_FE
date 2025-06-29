import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, hasRole } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link className="navbar-brand" to="/">
        Hệ thống Đánh Giá Nhân Viên
      </Link>
      
      <div className="ms-auto">
        {user ? (
          <>
            <span className="me-3">
              Xin chào, {user.fullName || user.username} 
              <span className="badge bg-secondary ms-1">
                {user.role === 'SUP' ? 'Quản trị viên' : 
                 user.role === 'MANA' ? 'Quản lý' : 'Nhân viên'}
              </span>
              {user.isDepartmentManager && (
                <span className="badge bg-info ms-1">Trưởng phòng</span>
              )}
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link className="btn btn-outline-primary btn-sm" to="/login">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
