import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { validateStudentLogin } from '../api'; // Add the API call to validate the student login

const ExamCenterLogin = ({ examId }) => {
    const [studentName, setStudentName] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        try {
            const response = await validateStudentLogin(examId, studentName, username);
            if (response.success) {
                // Redirect to the exam page if the student is valid
                history.push(`/exam-center/exam/${examId}/questions`);
            } else {
                setMessage('Student not registered for this exam');
            }
        } catch (error) {
            console.error(error);
            setMessage('An error occurred during login');
        }
    };

    return (
        <div>
            <h2>Login to Exam Center</h2>
            <input
                type="text"
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {message && <div>{message}</div>}
        </div>
    );
};

export default ExamCenterLogin;