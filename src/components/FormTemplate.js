import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Modal,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const FormTemplate = () => {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [criteriaList, setCriteriaList] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [newCriteria, setNewCriteria] = useState({
    criteriaName: "",
    category: "Năng lực",
    description: "",
    defaultMaxScore: 10,
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/criteria", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCriteriaList(data.data);
        }
      });
  }, []);

  const handleCreateCriteria = () => {
    fetch("http://localhost:8080/api/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newCriteria),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCriteriaList([...criteriaList, data.data]);
          setNewCriteria({
            criteriaName: "",
            category: "Năng lực",
            description: "",
            defaultMaxScore: 10,
          });
        }
      });
  };

  const handleAddCriteria = (criteria) => {
    if (!selectedCriteria.find((c) => c.criteriaId === criteria.criteriaId)) {
      setSelectedCriteria([...selectedCriteria, criteria]);
      setShowModal(false);
    }
  };

  const handleRemoveCriteria = (id) => {
    setSelectedCriteria(selectedCriteria.filter((c) => c.criteriaId !== id));
  };

  const handleSaveTemplate = () => {
    if (!templateName || selectedCriteria.length === 0) {
      alert("Vui lòng nhập tên mẫu và chọn ít nhất một tiêu chí");
      return;
    }

    const payload = {
      templateName,
      description: templateDescription,
      criteriaIds: selectedCriteria.map((c) => c.criteriaId),
    };

    fetch("http://localhost:8080/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Tạo mẫu thành công");
          navigate("/evaluation_Review");
        }
      });
  };

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h3>Tạo Mẫu Đánh Giá Mới</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên mẫu đánh giá</Form.Label>
              <Form.Control
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-success text-white d-flex justify-content-between">
          <h4 className="mb-0">Tiêu Chí Đã Chọn</h4>
          <Button variant="light" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg"></i> Thêm Tiêu Chí
          </Button>
        </Card.Header>
        <Card.Body>
          <ListGroup>
            {selectedCriteria.map((item) => (
              <ListGroup.Item
                key={item.criteriaId}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6>{item.criteriaName}</h6>
                  <span className="badge bg-info me-2">{item.category}</span>
                  <small className="text-muted d-block">
                    {item.description}
                  </small>
                  <small className="text-muted">
                    Điểm tối đa: {item.defaultMaxScore}
                  </small>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveCriteria(item.criteriaId)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <div className="mb-4">
        <Button variant="primary" onClick={handleSaveTemplate} className="me-2">
          <i className="bi bi-save"></i> Lưu Mẫu
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/evaluation_Review")}
        >
          <i className="bi bi-arrow-left"></i> Quay Lại
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Tiêu Chí</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="mb-4">
            <h6>Tạo Tiêu Chí Mới</h6>
            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  placeholder="Tên tiêu chí"
                  value={newCriteria.criteriaName}
                  onChange={(e) =>
                    setNewCriteria({
                      ...newCriteria,
                      criteriaName: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={newCriteria.category}
                  onChange={(e) =>
                    setNewCriteria({ ...newCriteria, category: e.target.value })
                  }
                >
                  <option value="Năng lực">Năng lực</option>
                  <option value="Thái độ">Thái độ</option>
                  <option value="Hiệu suất">Hiệu suất</option>
                  <option value="Kỹ năng mềm">Kỹ năng mềm</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Mô tả"
                  value={newCriteria.description}
                  onChange={(e) =>
                    setNewCriteria({
                      ...newCriteria,
                      description: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  min={1}
                  max={10}
                  value={newCriteria.defaultMaxScore}
                  onChange={(e) =>
                    setNewCriteria({
                      ...newCriteria,
                      defaultMaxScore: Number(e.target.value),
                    })
                  }
                />
              </Col>
            </Row>
            <Button
              variant="primary"
              className="mt-3"
              onClick={handleCreateCriteria}
            >
              <i className="bi bi-plus-circle"></i> Tạo Tiêu Chí
            </Button>
          </Form>

          <h6>Danh Sách Tiêu Chí Hiện Có</h6>
          <ListGroup>
            {criteriaList.map((criteria) => (
              <ListGroup.Item
                key={criteria.criteriaId}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6>{criteria.criteriaName}</h6>
                  <span className="badge bg-info me-2">
                    {criteria.category}
                  </span>
                  <small className="text-muted d-block">
                    {criteria.description}
                  </small>
                  <small className="text-muted">
                    Điểm tối đa: {criteria.defaultMaxScore}
                  </small>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddCriteria(criteria)}
                >
                  <i className="bi bi-plus"></i>
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default FormTemplate;
