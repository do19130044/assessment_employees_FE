import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Unauthorized from "./pages/Unauthorized";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

import HomePage from "./components/HomePage";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetail from "./components/EmployeeDetail";
import CreateReview from "./components/CreateReview";
import EvaluatePage from "./components/EvaluatePage";
import ManageCriteria from "./components/ManageCriteria";
import TemplateList from "./components/TemplateList";
import ViewTemplate from "./components/ViewTemplate";
import FormTemplate from "./components/FormTemplate";
import EvaluationReview from "./components/EvaluationReview";

// Component để xử lý routing với authentication check
const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Root route - redirect based on authentication */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? (
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Protected routes */}
      <Route
        path="/EmployeeList"
        element={
          <PrivateRoute roles={["SUP", "MANA"]}>
            <EmployeeList />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/:userId"
        element={
          <PrivateRoute roles={["SUP", "EMPL"]}>
            <EmployeeDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/Create_review"
        element={
          <PrivateRoute roles={["SUP", "MANA"]}>
            <CreateReview />
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluate"
        element={
          <PrivateRoute roles={["SUP", "MANA"]}>
            <EvaluatePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/manage_criteria"
        element={
          <PrivateRoute roles={["SUP", "MANA"]}>
            <ManageCriteria />
          </PrivateRoute>
        }
      />
      <Route
        path="/TemplateList"
        element={
          <PrivateRoute roles={["SUP"]}>
            <TemplateList />
          </PrivateRoute>
        }
      />
      <Route
        path="/ViewTemplate/:templateId"
        element={
          <PrivateRoute>
            <ViewTemplate />
          </PrivateRoute>
        }
      />
      <Route
        path="/FormTemplate"
        element={
          <PrivateRoute roles={["SUP"]}>
            <FormTemplate />
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluation_Review"
        element={
          <PrivateRoute>
            <EvaluationReview />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
