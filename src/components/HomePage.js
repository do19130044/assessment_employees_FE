import React, { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const HomePage = () => {
  const { user, hasRole } = useContext(AuthContext);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SUP': return 'Quản trị viên';
      case 'MANA': return 'Quản lý';
      case 'EMPL': return 'Nhân viên';
      default: return role;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Container className="mt-5">
        <div className="text-center mb-5">
          <h1 className="display-4">Hệ Thống Đánh Giá Nhân Viên</h1>
          <p className="lead">
            Quản lý và đánh giá hiệu suất nhân viên một cách hiệu quả
          </p>
          {user && (
            <div className="alert alert-info mt-3">
              <h5>Chào mừng, {user.fullName}!</h5>
              <p className="mb-0">
                Chức vụ: <strong>{getRoleDisplayName(user.role)}</strong>
                {user.isDepartmentManager && <span className="badge bg-warning text-dark ms-2">Trưởng phòng</span>}
              </p>
            </div>
          )}
        </div>

        <Row xs={1} md={2} className="g-4">
          {/* Thông Tin Cá Nhân - cho EMPL */}
          {hasRole('EMPL') && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-person-circle text-primary"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Thông Tin Cá Nhân</h2>
                  <Card.Text>
                    Xem thông tin cá nhân và kết quả đánh giá của bạn.
                  </Card.Text>
                  <Link to={`/employee/${user.userId}`}>
                    <Button variant="primary" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Xem Chi Tiết
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Kết Quả Đánh Giá - cho EMPL */}
          {hasRole('EMPL') && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-clipboard-data text-success"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Kết Quả Đánh Giá</h2>
                  <Card.Text>
                    Xem chi tiết các đánh giá và phản hồi từ cấp trên.
                  </Card.Text>
                  <Link to="/evaluation_Review">
                    <Button variant="success" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Xem Đánh Giá
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Quản Lý Nhân Viên - chỉ cho SUP và MANA */}
          {(hasRole('SUP') || hasRole('MANA')) && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-people-fill text-primary"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Quản Lý Nhân Viên</h2>
                  <Card.Text>
                    Thêm, sửa, xóa và xem thông tin chi tiết của nhân viên.
                  </Card.Text>
                  <Link to="/EmployeeList">
                    <Button variant="primary" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Truy Cập
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Đánh Giá Nhân Viên - chỉ cho SUP và MANA */}
          {(hasRole('SUP') || hasRole('MANA')) && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-clipboard-check text-success"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Đánh Giá Nhân Viên</h2>
                  <Card.Text>
                    Tạo, quản lý và xem kết quả đánh giá hiệu suất nhân viên.
                  </Card.Text>
                  <Link to="/Create_review">
                    <Button variant="success" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Truy Cập
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Quản Lý Tiêu Chí - chỉ cho SUP và MANA */}
          {(hasRole('SUP') || hasRole('MANA')) && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-list-check text-warning"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Quản Lý Tiêu Chí</h2>
                  <Card.Text>
                    Tạo và quản lý các tiêu chí đánh giá hiệu suất nhân viên.
                  </Card.Text>
                  <Link to="/manage_criteria">
                    <Button variant="warning" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Truy Cập
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Danh Sách Mẫu Đánh Giá - chỉ cho SUP */}
          {hasRole('SUP') && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-ui-checks-grid text-secondary"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Mẫu Đánh Giá</h2>
                  <Card.Text>
                    Tạo, chỉnh sửa và quản lý danh sách mẫu đánh giá nhân viên.
                  </Card.Text>
                  <Link to="/TemplateList">
                    <Button variant="secondary" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Truy Cập
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Báo Cáo & Thống Kê - chỉ cho SUP và MANA */}
          {(hasRole('SUP') || hasRole('MANA')) && (
            <Col>
              <Card className="h-100 shadow-sm rounded-4 custom-card">
                <Card.Body className="text-center">
                  <i
                    className="bi bi-bar-chart text-info"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h2 className="mt-3">Báo Cáo & Thống Kê</h2>
                  <Card.Text>
                    Xem báo cáo và thống kê hiệu suất nhân viên theo thời gian.
                  </Card.Text>
                  <Link to="/reports">
                    <Button variant="info" className="px-4">
                      <i className="bi bi-arrow-right-circle"></i> Truy Cập
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        <footer className="mt-5 text-center text-muted">
          <p>Hệ Thống Đánh Giá Nhân Viên</p>
        </footer>
      </Container>
    </div>
  );
};

export default HomePage;
