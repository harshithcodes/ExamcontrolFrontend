import React, { useState, useEffect } from "react";
import { getAvailableExams, registerForExam, getRegisteredExams } from "../api";
import { useAuth } from "../AuthContext";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { auth } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [registeredExams, setRegisteredExams] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRegisteredExams, setLoadingRegisteredExams] = useState(true);

  useEffect(() => {
    const fetchRegisteredExams = async () => {
      try {
        setLoadingRegisteredExams(true);
        console.log(auth.id);
        const response = await getRegisteredExams(auth.id);
        setRegisteredExams(response); // Set the registered exams state
      } catch (error) {
        console.error("Error fetching registered exams:", error);
        setMessage("Failed to load registered exams.");
      } finally {
        setLoadingRegisteredExams(false);
      }
    };

    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const response = await getAvailableExams();
        setExams(response); // Set the available exams state
      } catch (error) {
        console.error("Error fetching exams:", error);
        setMessage("Failed to load exams. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Call both fetch functions
    fetchRegisteredExams();
    fetchExams();
  }, [auth.id]);

  const handleExamSelect = (examId) => {
    setSelectedExamId(examId);
  };

  const handleRegister = async () => {
    if (!selectedExamId) {
      setMessage("⚠️ Please select an exam to register.");
      return;
    }

    try {
      const response = await registerForExam(selectedExamId, auth.id);
      setMessage("✅ Successfully registered for the exam!");

      // Refresh the registered exams dynamically after successful registration
      const updatedRegisteredExams = await getRegisteredExams(auth.id);
      setRegisteredExams(updatedRegisteredExams);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        "❌ Error during registration. " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (isLoading || loadingRegisteredExams) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📘 Student Dashboard</h1>
        <p>Explore and register for upcoming exams!</p>
      </div>

      <div className="exam-list">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className={`exam-card ${
                exam.id === selectedExamId ? "selected" : ""
              }`}
              onClick={() => handleExamSelect(exam.id)}
            >
              <div className="exam-title">{exam.title}</div>
              <div className="exam-details">
                <div className="exam-date">
                  📅 {exam.date} | <strong>Last Date to Apply:</strong>{" "}
                  {exam.lastDateToApply}
                </div>
                <div className="exam-subject">Subject: {exam.subject}</div>
                <div className="exam-marks">Total Marks: {exam.totalMarks}</div>
                <div className="exam-instructions">
                  Exam Instructions:
                  <ul>
                    {exam.instructions
                      .split("\n")
                      .map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-exams-message">No exams available currently.</p>
        )}
      </div>

      <button
        className={`register-button ${!selectedExamId ? "disabled" : ""}`}
        onClick={handleRegister}
        disabled={!selectedExamId}
      >
        Register for Exam
      </button>

      {message && <div className="message-container">{message}</div>}

      {/* Display registered exams */}
      {registeredExams.length > 0 ? (
        <div className="registered-exams">
          <h2>Registered Exams</h2>
          <div className="registered-exam-list">
            {registeredExams.map((exam) => (
              <div key={exam.id} className="registered-exam-card">
                <div className="registered-exam-title">{exam.title}</div>
                <div className="registered-exam-date">📅 {exam.date}</div>
                <div className="registered-exam-subjects">
                  <strong>Subjects:</strong> {exam.subject}
                </div>
                <div className="registered-exam-totalMarks">
                  <strong>Total Marks:</strong> {exam.totalMarks}
                </div>
                <div className="exam-instructions">
                  <strong>Instructions:</strong>
                  <ul>
                    {exam.instructions.split("\n").map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="not-registered-message">
          You have not registered for any exams yet.
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
