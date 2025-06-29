// TemplateList.js - Danh Sách Mẫu Đánh Giá (React + Bootstrap)
import React, { useEffect, useState, useContext } from "react";
import { Table, Button, Container, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, hasRole } = useContext(AuthContext);

  const API_URL = "http://localhost:8080/api/templates";

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const data = await res.json();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách mẫu.");
    }
  };

  const handleDelete = async (id) => {
    if (!hasRole('SUP')) {
      alert('Bạn không có quyền xóa mẫu đánh giá.');
      return;
    }
    
    if (window.confirm("Bạn có chắc muốn xóa mẫu này không?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        if (res.ok) {
          fetchTemplates();
          alert("Xóa thành công!");
        } else {
          const errorData = await res.json();
          alert(errorData.message || 'Không thể xóa mẫu.');
        }
      } catch (err) {
        console.error(err);
        alert("Không thể xóa mẫu.");
      }
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const search = searchTerm.toLowerCase();
    return (
      t.templateName.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search) ||
      new Date(t.createdAt).toLocaleString("vi-VN").includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Danh Sách Mẫu Đánh Giá</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="mb-3">
        <Button
          variant="secondary"
          className="me-2"
          onClick={() => navigate("/")}
        >
          Quay về
        </Button>
        {hasRole('SUP') && (
          <Button variant="success" onClick={() => navigate("/FormTemplate")}>
            Thêm Mẫu
          </Button>
        )}
      </div>
      <Form.Control
        type="text"
        placeholder="Tìm kiếm theo tên hoặc ngày tạo..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table bordered hover>
        <thead>
          <tr>
            <th>Tên Mẫu</th>
            <th>Mô tả</th>
            <th>Thời Gian Tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredTemplates.map((template) => (
            <tr key={template.templateId}>
              <td>{template.templateName}</td>
              <td>{template.description || "Không có mô tả"}</td>
              <td>{formatDate(template.createdAt)}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  className="me-2"
                  onClick={() =>
                    navigate(`/ViewTemplate/${template.templateId}`)
                  }
                >
                  Xem
                </Button>
                {hasRole('SUP') && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(template.templateId)}
                  >
                    Xóa
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {filteredTemplates.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                Không có mẫu nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default TemplateList;
