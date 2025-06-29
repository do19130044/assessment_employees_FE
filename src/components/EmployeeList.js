import React, {useState, useEffect, useCallback, useContext} from "react";
import {
    Button,
    Card,
    Form,
    Table,
    Modal,
    Spinner,
    Alert,
} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "http://localhost:8080/api/users";
const DEPT_API_URL = "http://localhost:8080/api/departments";

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({show: false, message: "", variant: ""});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [formMode, setFormMode] = useState("add");
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "EMPL",
        departmentId: "",
        password: "",
        isDepartmentManager: false,
    });
    const [departments, setDepartments] = useState([]);

    const navigate = useNavigate();
    const {user, hasRole, canAccessUser} = useContext(AuthContext);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            setEmployees(data.data);
            setFilteredEmployees(data.data);
        } catch (error) {
            showAlert("Không thể tải dữ liệu người dùng", "danger");
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            const res = await fetch(DEPT_API_URL, {
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await res.json();
            setDepartments(data.data);
        } catch (error) {
            showAlert("Không thể tải danh sách phòng ban", "danger");
            console.error('Error fetching departments:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, [fetchUsers, fetchDepartments]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = employees.filter(
            (emp) =>
                emp.username.toLowerCase().includes(value) ||
                emp.fullName.toLowerCase().includes(value) ||
                emp.role.toLowerCase().includes(value) ||
                emp.department.departmentName.toLowerCase().includes(value)
        );
        setFilteredEmployees(filtered);
    };

    const showAlert = (message, variant) => {
        setAlert({show: true, message, variant});
        setTimeout(() => setAlert({show: false, message: "", variant: ""}), 3000);
    };

    const exportToExcel = () => {
        const dataToExport = filteredEmployees.map((emp, index) => ({
            STT: index + 1,
            Username: emp.username,
            FullName: emp.fullName,
            Role: emp.role,
            Department: emp.department.departmentName,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
        XLSX.writeFile(workbook, "DanhSachNhanVien.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["#", "Username", "Full Name", "Role", "Phòng Ban"];
        const tableRows = filteredEmployees.map((emp, index) => [
            index + 1,
            emp.username,
            emp.fullName,
            emp.role,
            emp.department.departmentName,
        ]);
        doc.text("Danh Sách Nhân Viên", 14, 10);
        doc.autoTable({head: [tableColumn], body: tableRows, startY: 20});
        doc.save("DanhSachNhanVien.pdf");
    };

    const openFormModal = (mode, emp = null) => {
        setFormMode(mode);
        if (mode === "edit" && emp) {
            setFormData({
                username: emp.username,
                fullName: emp.fullName,
                email: emp.email,
                role: emp.role,
                departmentId: emp.department.departmentId,
                password: "",
                isDepartmentManager: emp.isDepartmentManager || false,
            });
            setSelectedUserId(emp.userId);
        } else {
            setFormData({
                username: "",
                fullName: "",
                email: "",
                role: "EMPL",
                departmentId: "",
                password: "",
                isDepartmentManager: false,
            });
        }
        setShowFormModal(true);
    };

    const handleFormSubmit = async () => {
        const url = formMode === "add" ? API_URL : `${API_URL}/${selectedUserId}`;
        const method = formMode === "add" ? "POST" : "PUT";

        // Prepare form data - remove password if empty for edit mode
        const submitData = {...formData};
        if (formMode === "edit" && !submitData.password) {
            delete submitData.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi gửi dữ liệu");
            }

            await fetchUsers();
            setShowFormModal(false);
            showAlert(
                formMode === "add" ? "Thêm thành công" : "Cập nhật thành công",
                "success"
            );
        } catch (error) {
            showAlert(error.message || "Lỗi khi lưu dữ liệu", "danger");
            console.error('Error submitting form:', error);
        }
    };

    const confirmDelete = (userId) => {
        setSelectedUserId(userId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`${API_URL}/${selectedUserId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Lỗi khi xóa");
            }

            await fetchUsers();
            showAlert("Xóa nhân viên thành công", "success");
        } catch (error) {
            showAlert(error.message || "Lỗi khi xóa", "danger");
            console.error('Error deleting user:', error);
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="container mt-4">
            <Card>
                <Card.Header className="bg-dark text-white text-center">
                    <h4>Danh Sách Nhân Viên</h4>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="mt-2"
                    />
                </Card.Header>
                <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                        <Button variant="secondary" onClick={() => navigate("/")}>
                            Quay Lại
                        </Button>
                        <div>
                            <Button
                                className="me-2"
                                variant="success"
                                onClick={exportToExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Button className="me-2" variant="danger" onClick={exportToPDF} if>
                                Xuất PDF
                            </Button>
                            {hasRole('SUP') && (
                                <Button variant="primary" onClick={() => openFormModal("add")}>
                                    Thêm Nhân Viên
                                </Button>
                            )}
                        </div>
                    </div>

                    {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}

                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border"/>
                        </div>
                    ) : (
                        <Table striped bordered hover responsive className="text-center">
                            <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phòng Ban</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredEmployees.map((emp, index) => (
                                <tr key={emp.userId}>
                                    <td>{index + 1}</td>
                                    <td>{emp.username}</td>
                                    <td>{emp.fullName}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.role}</td>
                                    <td>{emp.department.departmentName}</td>
                                    <td>
                                        {canAccessUser(emp.userId) && (
                                            <Button
                                                size="sm"
                                                variant="info"
                                                className="me-2"
                                                onClick={() => navigate(`/employee/${emp.userId}`)}
                                            >
                                                Xem
                                            </Button>
                                        )}
                                        {canAccessUser(emp.userId) && (
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                className="me-2"
                                                onClick={() => openFormModal("edit", emp)}
                                            >
                                                Sửa
                                            </Button>
                                        )}
                                        {hasRole('SUP') && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => confirmDelete(emp.userId)}
                                            >
                                                Xóa
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal xác nhận xoá */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xoá</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xoá nhân viên này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Huỷ
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Xoá
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm/sửa nhân viên */}
            <Modal
                show={showFormModal}
                onHide={() => setShowFormModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formMode === "add" ? "Thêm Nhân Viên" : "Sửa Nhân Viên"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({...formData, username: e.target.value})
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Họ tên</Form.Label>
                            <Form.Control
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({...formData, fullName: e.target.value})
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({...formData, email: e.target.value})
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Chức vụ</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({...formData, role: e.target.value})
                                }
                            >
                                <option value="EMPL">Nhân viên (EMPL)</option>
                                <option value="MANA">Quản lý (MANA)</option>
                                <option value="SUP">Quản trị viên (SUP)</option>
                            </Form.Select>
                        </Form.Group>
                        {formMode === "add" && (
                            <Form.Group className="mb-2">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({...formData, password: e.target.value})
                                    }
                                    required={formMode === "add"}
                                    placeholder="Nhập mật khẩu..."
                                />
                            </Form.Group>
                        )}
                        {formMode === "edit" && (
                            <Form.Group className="mb-2">
                                <Form.Label>Mật khẩu mới (để trống nếu không đổi)</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({...formData, password: e.target.value})
                                    }
                                    placeholder="Nhập mật khẩu mới..."
                                />
                            </Form.Group>
                        )}
                        <Form.Group className="mb-2">
                            <Form.Label>Phòng ban</Form.Label>
                            <Form.Select
                                value={formData.departmentId}
                                onChange={(e) =>
                                    setFormData({...formData, departmentId: e.target.value})
                                }
                            >
                                <option value="">-- Chọn phòng ban --</option>
                                {departments.map((d) => (
                                    <option key={d.departmentId} value={d.departmentId}>
                                        {d.departmentName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        {(formData.role === 'MANA' || formData.role === 'SUP') && (
                            <Form.Group className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Trưởng phòng ban"
                                    checked={formData.isDepartmentManager}
                                    onChange={(e) =>
                                        setFormData({...formData, isDepartmentManager: e.target.checked})
                                    }
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFormModal(false)}>
                        Huỷ
                    </Button>
                    <Button variant="primary" onClick={handleFormSubmit}>
                        {formMode === "add" ? "Thêm" : "Cập nhật"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EmployeeList;
