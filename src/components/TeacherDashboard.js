import React, { useState, useEffect } from "react";
import Modal from "./Modal"; // Modal component
import { fetchExamNotifications, applyExam, submitQuestionPaper, fetchApplyNotificationStatus } from "../api";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState([]);
    const [appliedNotifications, setAppliedNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        getNotificationStatus();
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await fetchExamNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (notificationId) => {
        setLoading(true);
        try {
            await applyExam(notificationId);
            setAppliedNotifications((prev) => [...prev, notificationId]);
            getNotificationStatus();
        } catch (error) {
            console.error("Error applying for exam:", error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationStatus = async () => {
        setLoading(true);
        try {
            const response = await fetchApplyNotificationStatus();
            setNotificationStatus(response);
        } catch (error) {
            console.error("Error fetching application status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetQuestionPaper = (notificationStatus) => {
        setSelectedExam(notificationStatus);
        setActiveModal("setQuestionPaper");
        setQuestions([]);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: "", options: ["", "", "", ""], answer: null, difficulty: "EASY" }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        if (field === "options") {
            updatedQuestions[index].options = value;
        } else {
            updatedQuestions[index][field] = value;
        }
        setQuestions(updatedQuestions);
    };

    const handleSubmitQuestions = async () => {
        for (const question of questions) {
            if (question.answer === null) {
                alert("Each question must have a correct answer selected.");
                return;
            }
        }
        try {
            await submitQuestionPaper(selectedExam.notificationId, questions);
            alert(`Questions submitted successfully for ${selectedExam.examTitle}`);
            setActiveModal(null);
        } catch (error) {
            console.error("Error submitting questions:", error);
        }
    };

    return (
        <div className="teacher-dashboard">
            <h1>Teacher Dashboard</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h2>Exam Notifications</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Exam</th>
                                <th>Exam Date</th>
                                <th>Subjects</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((notification) => {
                                const status = notificationStatus.find((status) => status.notificationId === notification.notificationId);
                                return (
                                    <tr key={notification.notificationId}>
                                        <td>{notification.notificationTitle}</td>
                                        <td>{notification.examTitle}</td>
                                        <td>{notification.examDate}</td>
                                        <td>{notification.subjects}</td>
                                        <td>{notification.description}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleApply(notification.notificationId)}
                                                disabled={
                                                    (status && status.status === "REQUEST_SENT") || (status && status.status === "APPROVED") || (status && status.status === "REJECTED")
                                                }
                                            >
                                                {(status && status.status === "REQUEST_SENT") || (status && status.status === "APPROVED") ||  (status && status.status === "REJECTED")
                                                    ? "Applied"
                                                    : "Apply"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <h2>Applied Exams</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Exam</th>
                                <th>Subjects</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notificationStatus.map((status) => (
                                <tr key={status.id}>
                                    <td>{status.notificationTitle}</td>
                                    <td>{status.examTitle}</td>
                                    <td>{status.subjects}</td>
                                    <td>{status.Date}</td>
                                    <td>{status.status}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            disabled={status.status !== "APPROVED"}
                                            onClick={() => handleSetQuestionPaper(status)}
                                        >
                                            Set Question Paper
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {activeModal === "setQuestionPaper" && (
                <Modal title="Set Question Paper" onClose={() => setActiveModal(null)}>
                    <h3>{selectedExam.examTitle}</h3>
                    <p>Subjects: {selectedExam.subjects}</p>
                    <div className="questions">
                        {questions.map((question, index) => (
                            <div key={index} className="question-card">
                                <label>
                                    Question:
                                        <div className="option-container">
                                        <input
                                            type="text"
                                            value={question.questionText}
                                            onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                                            className="question-input"
                                        />
                                        </div>


                                </label>
                                <div>
                                    Options:
                                    {question.options.map((option, optIndex) => (

                                        <div key={optIndex} className="option-container">
                                            <input
                                                type="radio"
                                                name={`answer-${index}`}
                                                checked={question.answer === optIndex}
                                                onChange={() => handleQuestionChange(index, "answer", optIndex)}
                                                className="radio-input"
                                            />
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => {
                                                    const updatedOptions = [...question.options];
                                                    updatedOptions[optIndex] = e.target.value;
                                                    handleQuestionChange(index, "options", updatedOptions);
                                                }}
                                                className="option-input"
                                            />

                                        </div>
                                    ))}
                                </div>
                                <label>
                                    Difficulty:
                                    <select
                                        value={question.difficulty}
                                        onChange={(e) => handleQuestionChange(index, "difficulty", e.target.value)}
                                        className="difficulty-select"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Difficult</option>
                                    </select>
                                </label>
                            </div>
                        ))}
                        <button className="btn btn-secondary" onClick={handleAddQuestion}>
                            Add Question
                        </button>
                    </div>
                    <button className="btn btn-success" onClick={handleSubmitQuestions}>
                        Submit Questions
                    </button>
                </Modal>
            )}

        </div>
    );
};

export default TeacherDashboard;
