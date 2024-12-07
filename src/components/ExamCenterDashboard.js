import React, { useEffect, useState } from 'react';
import { availableExams, getExamCenterDetails } from '../api'; // Fetch exams API
import { useNavigate } from 'react-router-dom';
import './ExamCenterDashboard.css';

function ExamCenterDashboard() {
    const [exams, setExams] = useState([]);
    const [examCenterDetails, setExamCenterDetails] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadExamCenterDetails();
        loadExams();
    }, []);
    const loadExamCenterDetails = async() => {
        try {
                const response = await getExamCenterDetails();
                setExamCenterDetails(response);

        } catch (err) {
            setError('Error fetching exams.');
        }
    }

    const loadExams = async () => {
        try {
            const response = await availableExams();
            setExams(response);
        } catch (err) {
            setError('Error fetching exams.');
        }
    };

    const handleHostExam = (exam) => {
            // Route to the Student Login page and pass the examId as a query parameter
            navigate(`/student-login?examId=${exam.exam.id}`);
        };

    return (
        <div className="exam-center-dashboard">
            <div className="exam-center-details-container">
                <h1 className="center-title">{examCenterDetails.centerName}</h1>
                <p className="center-code">Code: {examCenterDetails.centerCode}</p>
                <p className="center-address">
                    {examCenterDetails.address}, {examCenterDetails.city}, {examCenterDetails.state}
                </p>
            </div>

            <h2 className="assigned-exams-title">Assigned Exams</h2>

            {/* Move the error message here */}
            {error && <p className="error">{error}</p>}

            <ul className="exams-list">
                {exams.map((exam) => (
                    <li key={exam.id} className="exam-item">
                        <div className="exam-info">
                            <h3 className="exam.title">{exam.exam.title}</h3>
                            <p className="exam.date">Date: {exam.exam.date}</p>
                        </div>
                        <button className="host-exam-button" onClick={() => handleHostExam(exam)}>
                            Host Exam
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

}

export default ExamCenterDashboard;
