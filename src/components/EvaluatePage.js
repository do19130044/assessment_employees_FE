import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Pagination,
  Badge,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ITEMS_PER_PAGE = 5;

const categoryClassMap = {
  "Năng lực": "category-Năng-lực",
  "Thái độ": "category-Thái-độ",
  "Hiệu suất": "category-Hiệu-suất",
  "Kỹ năng mềm": "category-Kỹ-năng-mềm",
};

const EvaluatePage = () => {
  const [templateData, setTemplateData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataSaved, setIsDataSaved] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, token } = useContext(AuthContext);

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get("templateId");
  const departmentId = searchParams.get("departmentId");

  useEffect(() => {
    if (!templateId || !departmentId) {
      alert("Thiếu thông tin template hoặc phòng ban");
      navigate("/create-review");
      return;
    }
    loadTemplate(templateId);
    loadEmployees(departmentId);

    const handleBeforeUnload = (event) => {
      if (!isDataSaved) {
        event.preventDefault();
        event.returnValue =
          "Bạn có chắc chắn muốn rời khỏi trang mà không lưu đánh giá?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [templateId, departmentId, isDataSaved]);

  const loadTemplate = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/templates/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setTemplateData(data.data);
    } catch {
      alert("Không thể tải thông tin mẫu đánh giá");
    }
  };

  const loadEmployees = async (deptId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/departments/${deptId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch {
      alert("Không thể tải danh sách nhân viên");
    }
  };

  const handleScoreChange = (userId) => {
    const selects = document.querySelectorAll(
      `select[data-emp-id='${userId}']`
    );
    let total = 0;
    selects.forEach((sel) => (total += Number(sel.value)));
    const avg = total / selects.length;
    document.getElementById(`average-${userId}`).value = avg.toFixed(2);
    setIsDataSaved(false);
  };

  const saveAssessments = async () => {
    try {
      const assessmentPeriod =
        templateData.templateName.split(" ").pop() || "Q1-2025";
      const promises = employees.map(async (emp) => {
        const selects = document.querySelectorAll(
          `select[data-emp-id='${emp.userId}']`
        );
        const details = Array.from(selects).map((sel) => ({
          criteriaId: Number(sel.dataset.criteriaId),
          score: Number(sel.value),
          comments: "",
        }));

        const payload = {
          assessedUserId: emp.userId,
          assessorUserId: 1,
          templateId: templateData.templateId,
          assessmentPeriod,
          totalScore: parseFloat(
            document.getElementById(`average-${emp.userId}`).value
          ),
          comment: document.getElementById(`comment-${emp.userId}`).value,
          details,
        };

        const res = await fetch(
          "http://localhost:8080/api/assessments/submit",
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
          }
        );

        const result = await res.json();
        if (!res.ok || !result.success)
          throw new Error("Error saving one assessment");
        return result;
      });

      await Promise.all(promises);
      alert("Tất cả đánh giá đã được lưu thành công!");
      setIsDataSaved(true);
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu đánh giá");
    }
  };

  const pageCount = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow-lg">
        <h2 className="text-center mb-2">{templateData?.templateName}</h2>
        <p className="text-center text-muted">{templateData?.description}</p>
        <p className="text-center text-muted">
          Phòng ban:{" "}
          {employees[0]?.department?.departmentName || "Không xác định"}
        </p>

        {paginatedEmployees.map((emp) => (
          <Card key={emp.userId} className="mb-4">
            <Card.Header>
              <h5>Nhân viên: {emp.fullName}</h5>
              <small className="text-muted">{emp.email}</small>
            </Card.Header>
            <Card.Body>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Mô tả</th>
                    <th width="150">Đánh giá (0-10)</th>
                  </tr>
                </thead>
                <tbody>
                  {templateData?.criteria.map((cri) => (
                    <tr key={cri.criteria.criteriaId}>
                      <td>
                        {cri.criteria.criteriaName}
                        <Badge
                          className={`ms-2 ${
                            categoryClassMap[cri.criteria.category]
                          }`}
                        >
                          {cri.criteria.category}
                        </Badge>
                      </td>
                      <td>
                        <small>{cri.criteria.description}</small>
                      </td>
                      <td>
                        <Form.Select
                          className="score"
                          data-emp-id={emp.userId}
                          data-criteria-id={cri.criteria.criteriaId}
                          onChange={() => handleScoreChange(emp.userId)}
                        >
                          {Array.from({ length: cri.maxScore + 1 }, (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                  <tr className="table-info">
                    <td colSpan={2}>
                      <strong>Điểm trung bình</strong>
                    </td>
                    <td>
                      <Form.Control readOnly id={`average-${emp.userId}`} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <strong>Nhận xét</strong>
                    </td>
                    <td>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        id={`comment-${emp.userId}`}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))}

        <Pagination className="justify-content-center mt-4">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
          {Array.from({ length: pageCount }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
          />
        </Pagination>

        <div className="text-center mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/Create_review")}
          >
            Quay về
          </Button>{" "}
          <Button
            variant="primary"
            disabled={isDataSaved}
            onClick={saveAssessments}
          >
            Lưu đánh giá
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default EvaluatePage;
