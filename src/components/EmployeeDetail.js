// src/pages/EmployeeDetail.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner, Table, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "http://localhost:8080/api";
const REVIEWS_PER_PAGE = 3;

const EmployeeDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editStates, setEditStates] = useState({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`${API_BASE}/users/${userId}`, {
          headers: getAuthHeaders()
        });
        const userData = await userRes.json();
        setUser(userData.data);

        const assessRes = await fetch(
          `${API_BASE}/assessments/results/employee/${userId}`,
          {
            headers: getAuthHeaders()
          }
        );
        const assessData = await assessRes.json();
        setAssessments(assessData.data);
      } catch (err) {
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("vi-VN");

  const exportAssessmentToExcel = (assessment) => {
    const wsData = [
      ["PHIẾU ĐÁNH GIÁ NHÂN VIÊN"],
      [],
      ["Nhân viên:", user.fullName],
      ["Phòng ban:", user.department.departmentName],
      ["Ngày đánh giá:", formatDate(assessment.submissionDate)],
      ["ID đánh giá:", assessment.assessmentId.toString()],
      [],
      ["TIÊU CHÍ ĐÁNH GIÁ", "ĐIỂM", "MÔ TẢ"],
    ];

    assessment.criteriaResults.forEach((cr) => {
      wsData.push([cr.criteriaName, cr.score, cr.criteriaDescription]);
    });

    wsData.push(
      [],
      ["ĐIỂM TRUNG BÌNH", assessment.totalScore.toFixed(1)],
      ["NHẬN XÉT", assessment.overallComment || "Không có nhận xét"]
    );

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Đánh giá");
    XLSX.writeFile(
      wb,
      `DanhGia_${user.fullName.replace(/\s+/g, "_")}_$${
        assessment.assessmentId
      }.xlsx`
    );
  };

  const handleSave = async (assessmentId) => {
    const edited = editStates[assessmentId];
    if (!edited) return;

    const updatedAssessment = {
      assessmentId,
      criteriaResults: edited.criteria || [],
      overallComment: edited.overallComment || "",
    };

    try {
      const res = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedAssessment),
      });
      if (!res.ok) throw new Error("Lỗi khi lưu đánh giá");

      const updated = await res.json();
      setAssessments((prev) =>
        prev.map((a) => (a.assessmentId === assessmentId ? updated.data : a))
      );
      setEditStates((prev) => {
        const copy = { ...prev };
        delete copy[assessmentId];
        return copy;
      });
    } catch (err) {
      alert("Không thể lưu đánh giá");
    }
  };

  const handleDelete = async (assessmentId) => {
    if (!window.confirm("Bạn có chắc muốn xoá đánh giá này không?")) return;
    try {
      await fetch(`${API_BASE}/assessments/${assessmentId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      setAssessments((prev) =>
        prev.filter((a) => a.assessmentId !== assessmentId)
      );
    } catch (err) {
      alert("Không thể xoá đánh giá");
    }
  };

  const pagedAssessments = assessments.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE
  );

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-dark text-white">
          Thông Tin Nhân Viên
        </Card.Header>
        <Card.Body>
          <p>
            <strong>Họ và Tên:</strong> {user.fullName}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Chức Vụ:</strong> {user.role}
          </p>
          <p>
            <strong>Phòng Ban:</strong> {user.department.departmentName}
          </p>
          <p>
            <strong>Ngày Tạo:</strong> {formatDate(user.createdAt)}
          </p>
          <p>
            <strong>Cập Nhật Lần Cuối:</strong> {formatDate(user.updatedAt)}
          </p>
        </Card.Body>
      </Card>

      <h5 className="mb-3">Lịch Sử Đánh Giá</h5>
      {pagedAssessments.map((asmt, idx) => (
        <Card className="mb-3" key={asmt.assessmentId}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              Đánh giá #{asmt.assessmentId} - {formatDate(asmt.submissionDate)}
            </div>
            <div>
              <Button
                size="sm"
                className="me-2"
                onClick={() => exportAssessmentToExcel(asmt)}
              >
                <i className="bi bi-file-earmark-excel"></i> Xuất Excel
              </Button>
              <Button
                size="sm"
                variant="success"
                className="me-2"
                onClick={() => handleSave(asmt.assessmentId)}
              >
                <i className="bi bi-save"></i> Lưu
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(asmt.assessmentId)}
              >
                <i className="bi bi-trash"></i> Xoá
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table bordered>
              <tbody>
                {asmt.criteriaResults?.map((cr, i) => (
                  <tr key={i}>
                    <th>{cr.criteriaName}</th>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        className="form-control"
                        value={
                          editStates[asmt.assessmentId]?.criteria?.[i]?.score ??
                          cr.score
                        }
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setEditStates((prev) => {
                            const updated = {
                              ...(prev[asmt.assessmentId] || { criteria: [] }),
                            };
                            updated.criteria[i] = {
                              ...cr,
                              score: isNaN(value) ? "" : value,
                            };
                            return { ...prev, [asmt.assessmentId]: updated };
                          });
                        }}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="table-primary">
                  <th>Điểm Trung Bình</th>
                  <td>{asmt.totalScore.toFixed(1)}</td>
                </tr>
                <tr className="table-warning">
                  <th>Nhận Xét</th>
                  <td>
                    <textarea
                      className="form-control"
                      value={
                        editStates[asmt.assessmentId]?.overallComment ??
                        asmt.overallComment ??
                        ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditStates((prev) => ({
                          ...prev,
                          [asmt.assessmentId]: {
                            ...(prev[asmt.assessmentId] || {}),
                            overallComment: value,
                          },
                        }));
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}

      <div className="d-flex justify-content-between">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Trang trước
        </Button>
        <Button
          disabled={page * REVIEWS_PER_PAGE >= assessments.length}
          onClick={() => setPage(page + 1)}
        >
          Trang sau
        </Button>
      </div>

      <div className="text-center mt-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Quay Lại
        </Button>
      </div>
    </div>
  );
};
export default EmployeeDetail;
