import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const CreateReview = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [templateError, setTemplateError] = useState(false);
  const [departmentError, setDepartmentError] = useState(false);

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    loadTemplates();
    loadDepartments();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/templates", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const activeTemplates = result.data.filter((t) => t.isActive);
        setTemplates(activeTemplates);
      }
    } catch (err) {
      console.error("Error loading templates", err);
      alert("Không thể tải danh sách mẫu đánh giá");
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/departments", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setDepartments(result.data);
      }
    } catch (err) {
      console.error("Error loading departments", err);
      alert("Không thể tải danh sách phòng ban");
    }
  };

  const handleEvaluate = () => {
    let isValid = true;
    setTemplateError(false);
    setDepartmentError(false);

    if (!selectedTemplate) {
      setTemplateError(true);
      isValid = false;
    }

    if (!selectedDepartment) {
      setDepartmentError(true);
      isValid = false;
    }

    if (isValid) {
      navigate(
        `/evaluate?templateId=${encodeURIComponent(
          selectedTemplate
        )}&departmentId=${encodeURIComponent(selectedDepartment)}`
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEvaluate();
    }
  };

  return (
    <Container className="mt-5" onKeyDown={handleKeyDown}>
      <Card className="p-4 shadow-lg">
        <h2 className="text-center mb-4">Đánh Giá</h2>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>
              Mẫu đánh giá <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- Chọn mẫu đánh giá --</option>
              {templates.map((template) => (
                <option
                  key={template.templateId}
                  value={template.templateId}
                  title={template.description || ""}
                >
                  {template.templateName}
                </option>
              ))}
            </Form.Select>
            {templateError && (
              <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                Vui lòng chọn mẫu đánh giá.
              </div>
            )}
          </Col>

          <Col md={6}>
            <Form.Label>
              Phòng ban <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dept) => (
                <option
                  key={dept.departmentId}
                  value={dept.departmentId}
                  title={dept.description || ""}
                >
                  {dept.departmentName}
                </option>
              ))}
            </Form.Select>
            {departmentError && (
              <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                Vui lòng chọn phòng ban.
              </div>
            )}
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate("/")}>
            Quay về
          </Button>
          <Button variant="primary" onClick={handleEvaluate}>
            Đánh giá
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default CreateReview;
