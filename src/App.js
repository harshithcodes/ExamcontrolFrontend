import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import COEDashboard from "./components/COEDashboard";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ExamCenterDashboard from "./components/ExamCenterDashboard";
import StudentLogin from "./components/StudentLogin";
import ExamPage from "./components/ExamPage";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/exam-center-dashboard" element={<ExamCenterDashboard />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/exam-page" element={<ExamPage />} />
        <Route path="/coe-dashboard" element={<COEDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
