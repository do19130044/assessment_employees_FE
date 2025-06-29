// ViewTemplate.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ViewTemplate = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/templates/${templateId}`,
          { headers: getAuthHeaders() }
        );
        const data = await res.json();
        if (data.success) setTemplate(data.data);
      } catch (error) {
        alert("Không thể tải thông tin mẫu đánh giá.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) fetchTemplate();
    else navigate("/TemplateList");
  }, [templateId, navigate]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!template)
    return <div className="text-center mt-5">Không tìm thấy mẫu đánh giá.</div>;

  const sortedCriteria = [...template.criteria].sort(
    (a, b) => a.criteriaOrder - b.criteriaOrder
  );

  const getCategoryClass = (category) => {
    const base = "category-badge ";
    return (
      base +
        {
          "Năng lực": "bg-info text-dark",
          "Thái độ": "bg-warning text-dark",
          "Hiệu suất": "bg-success text-white",
          "Kỹ năng mềm": "bg-light text-dark",
        }[category] || "bg-secondary text-white"
    );
  };

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h2>{template.templateName}</h2>
          <p className="mb-0">{template.description}</p>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Thời gian tạo:</strong> {formatDate(template.createdAt)}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Cập nhật lần cuối:</strong>{" "}
                {formatDate(template.updatedAt)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="bg-secondary text-white">
          <h4>Danh sách tiêu chí đánh giá</h4>
        </Card.Header>
        <Card.Body>
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tiêu chí</th>
                <th>Mô tả</th>
                <th>Điểm tối đa</th>
              </tr>
            </thead>
            <tbody>
              {sortedCriteria.map((item, index) => (
                <tr key={item.criteria.criteriaId}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    {item.criteria.criteriaName}{" "}
                    <span className={getCategoryClass(item.criteria.category)}>
                      {item.criteria.category}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {item.criteria.description}
                  </td>
                  <td className="text-center">{item.maxScore}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="mt-4">
        <Button variant="secondary" onClick={() => navigate("/TemplateList")}>
          Quay lại
        </Button>
      </div>
    </Container>
  );
};

export default ViewTemplate;
