import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Table, Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EvaluationReview = () => {
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/departments").then((res) => {
      const data = res.data?.data || res.data;
      setDepartments(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8080/api/templates").then((res) => {
      const data = res.data?.data || res.data;
      setTemplates(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    if (selectedDept && selectedTemplate) {
      axios
        .get("http://localhost:8080/api/evaluations/report", {
          params: {
            departmentId: selectedDept,
            templateId: selectedTemplate,
          },
        })
        .then((res) => {
          setReportData(res.data?.data || []);
        });
    } else {
      setReportData([]);
    }
  }, [selectedDept, selectedTemplate]);

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header className="bg-info text-white">
          <h4>
            <i className="bi bi-graph-up"></i> Báo Cáo & Thống Kê
          </h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phòng ban</Form.Label>
                <Form.Select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">-- Tất cả --</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mẫu đánh giá</Form.Label>
                <Form.Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">-- Tất cả --</option>
                  {templates.map((tpl) => (
                    <option key={tpl.templateId} value={tpl.templateId}>
                      {tpl.templateName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {reportData.length > 0 ? (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Phòng ban</th>
                    <th>Mẫu đánh giá</th>
                    <th>Điểm trung bình</th>
                    <th>Ngày đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.employeeName}</td>
                      <td>{item.departmentName}</td>
                      <td>{item.templateName}</td>
                      <td>{item.averageScore}</td>
                      <td>
                        {new Date(item.evaluationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h5 className="mt-4">Biểu đồ thống kê điểm trung bình</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={reportData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employeeName" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="averageScore"
                    fill="#007bff"
                    name="Điểm trung bình"
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-muted mt-4">Chọn bộ lọc để xem thống kê.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EvaluationReview;
