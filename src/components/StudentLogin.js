import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginStudent } from '../api'; // Login and fetch exams API
import './StudentLogin.css';

function StudentLogin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [studentExam, setStudentExam] = useState(null);
    const [error, setError] = useState('');
    const [examId, setExamId] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setExamId(params.get('examId')); // Get examId from query params
    }, [location]);

    const handleLogin = async () => {
        try {
            const response = await loginStudent(studentId, password, examId);
                setStudentExam(response);
                setShowModal(true); // Show the modal on successful login
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    const handleAttemptExam = () => {
        setShowModal(false);
        navigate(`/exam-page?examId=${studentExam.examId}&studentId=${studentId}`); // Navigate to the ExamPage
    };

   return(
             <div className="student-login">
               <h2>Student Login</h2>

               {error && <p className="error">{error}</p>}

               <div className="input-container">
                   <input
                       type="text"
                       placeholder="Student ID"
                       value={studentId}
                       onChange={(e) => setStudentId(e.target.value)}
                       className="input-field"
                   />
                   <input
                       type="password"
                       placeholder="Password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="input-field"
                   />
               </div>

               <button onClick={handleLogin} className="login-button">Login</button>

               {/* Modal for Attempt Exam */}
               {showModal && (
                   <div className="modal-overlay">
                       <div className="modal">

                               <h3 className="exam-details-title">Attempt Details</h3>
                               <div className="exam-info">
                                   <p><strong>Exam Title:</strong> <span>{studentExam.examTitle}</span></p>
                                   <p><strong>Exam ID:</strong> <span>{studentExam.examId}</span></p>
                                   <p><strong>Student Name:</strong> <span>{studentExam.studentName.username}</span></p>
                                   <p><strong>Student ID:</strong> <span>{studentExam.studentId}</span></p>

                           </div>
                           <button onClick={handleAttemptExam} className="attempt-exam-button">
                               Attempt Exam
                           </button>
                           <button onClick={() => setShowModal(false)} className="close-modal-button">
                               Close
                           </button>
                       </div>
                   </div>
               )}
           </div>
       );
}

export default StudentLogin;
