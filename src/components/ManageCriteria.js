// ManageCriteria.js (React + Bootstrap UI with API logic - Optimized with Filters)

import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  FormControl,
  Modal,
  Spinner,
  Alert,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

const CATEGORY_OPTIONS = ["Năng lực", "Thái độ", "Hiệu suất", "Đóng góp"];
const STATUS_OPTIONS = [
  { label: "-- Tất cả trạng thái --", value: "" },
  { label: "Đang hoạt động", value: "true" },
  { label: "Không hoạt động", value: "false" },
];
const API_URL = "http://localhost:8080/api/criteria";

const ManageCriteria = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [criteriaList, setCriteriaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState({
    add: false,
    edit: false,
    view: false,
    delete: false,
  });
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });
  const [form, setForm] = useState({
    criteriaName: "",
    category: "",
    description: "",
    defaultMaxScore: 10,
    isActive: true,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCriteriaList(data.data);
        setFilteredList(data.data);
      }
    } catch (err) {
      console.error(err);
      showMessage("danger", "Lỗi khi tải danh sách tiêu chí");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (variant, text) => {
    setMessage({ variant, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async (isEdit = false) => {
    try {
      setLoading(true);
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${API_URL}/${selectedCriteria.criteriaId}`
        : API_URL;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", `${isEdit ? "Cập nhật" : "Thêm"} thành công`);
        setShowModal({ ...showModal, add: false, edit: false });
        fetchCriteria();
      } else {
        showMessage(
          "warning",
          `${isEdit ? "Không thể cập nhật" : "Không thể thêm"}`
        );
      }
    } catch (err) {
      showMessage("danger", `Lỗi khi ${isEdit ? "cập nhật" : "thêm"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${selectedCriteria.criteriaId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", "Xóa thành công");
        setShowModal({ ...showModal, delete: false });
        fetchCriteria();
      } else {
        showMessage("warning", "Không thể xóa");
      }
    } catch (err) {
      showMessage("danger", "Lỗi khi xóa");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openModal = (type, item = null) => {
    setSelectedCriteria(item);
    if (type === "edit" && item) setForm(item);
    if (type === "add")
      setForm({
        criteriaName: "",
        category: "",
        description: "",
        defaultMaxScore: 10,
        isActive: true,
      });
    setShowModal({
      add: false,
      edit: false,
      view: false,
      delete: false,
      [type]: true,
    });
  };

  const applyFilters = () => {
    let result = [...criteriaList];
    if (filters.search)
      result = result.filter((c) =>
        c.criteriaName.toLowerCase().includes(filters.search.toLowerCase())
      );
    if (filters.category)
      result = result.filter((c) => c.category === filters.category);
    if (filters.status !== "")
      result = result.filter((c) => c.isActive.toString() === filters.status);
    setFilteredList(result);
  };

  useEffect(() => {
    fetchCriteria();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [filters, criteriaList]);

  return (
    <div className="container mt-5">
      {message && <Alert variant={message.variant}>{message.text}</Alert>}
      <Card>
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <h4>
            <i className="bi bi-list-check"></i> Quản lý Tiêu chí Đánh giá
          </h4>
          <Button variant="success" onClick={() => openModal("add")}>
            <i className="bi bi-plus-circle"></i> Thêm Tiêu chí
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <InputGroup>
                <FormControl
                  placeholder="Tìm kiếm tiêu chí..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                <Button variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">-- Tất cả danh mục --</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <ListGroup>
              {filteredList.map((item) => (
                <ListGroup.Item
                  key={item.criteriaId}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{item.criteriaName}</strong> – {item.description}
                    <div className="text-muted small">
                      Danh mục: {item.category} | Điểm tối đa:{" "}
                      {item.defaultMaxScore} |{" "}
                      {item.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => openModal("view", item)}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => openModal("edit", item)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openModal("delete", item)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Reusable Modal for Add/Edit */}
      <Modal
        show={showModal.add || showModal.edit}
        onHide={() => setShowModal({ ...showModal, add: false, edit: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showModal.edit ? "Chỉnh sửa" : "Thêm"} Tiêu chí
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên tiêu chí</Form.Label>
              <Form.Control
                name="criteriaName"
                value={form.criteriaName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                name="category"
                value={form.category}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Điểm tối đa</Form.Label>
              <Form.Control
                type="number"
                name="defaultMaxScore"
                value={form.defaultMaxScore}
                onChange={handleInputChange}
                min={1}
                max={10}
              />
            </Form.Group>
            {showModal.edit && (
              <Form.Check
                type="switch"
                label="Đang hoạt động"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShowModal({ ...showModal, add: false, edit: false })
            }
          >
            Hủy
          </Button>
          <Button
            variant={showModal.edit ? "primary" : "success"}
            onClick={() => handleSave(showModal.edit)}
          >
            {showModal.edit ? "Cập nhật" : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={showModal.view}
        onHide={() => setShowModal({ ...showModal, view: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Tiêu chí</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCriteria && (
            <>
              <p>
                <strong>ID:</strong> {selectedCriteria.criteriaId}
              </p>
              <p>
                <strong>Tên:</strong> {selectedCriteria.criteriaName}
              </p>
              <p>
                <strong>Danh mục:</strong> {selectedCriteria.category}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedCriteria.description}
              </p>
              <p>
                <strong>Điểm tối đa:</strong> {selectedCriteria.defaultMaxScore}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedCriteria.isActive
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal({ ...showModal, view: false })}
          >
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={() => openModal("edit", selectedCriteria)}
          >
            Chỉnh sửa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showModal.delete}
        onHide={() => setShowModal({ ...showModal, delete: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận Xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCriteria && (
            <p>
              Bạn có chắc chắn muốn xóa tiêu chí "
              {selectedCriteria.criteriaName}"?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal({ ...showModal, delete: false })}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageCriteria;
