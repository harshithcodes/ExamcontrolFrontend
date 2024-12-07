import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExamQuestions, submitExam } from '../api'; // Exam APIs
import './ExamPage.css';

function ExamPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [examId, setExamId] = useState('');
    const [studentId, setStudentId] = useState('');
    const [timer, setTimer] = useState(60); // Example: 1-hour timer
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        console.log("Location Search:", location.search);  // Log the search query
        const params = new URLSearchParams(location.search);

        const examIdFromParams = params.get("examId");
        const studentIdFromParams = params.get("studentId");

        console.log("Exam ID from params:", examIdFromParams);
        console.log("Student ID from params:", studentIdFromParams);

        setExamId(examIdFromParams);
        setStudentId(studentIdFromParams);
    }, [location.search]);

    useEffect(() => {
        if (examId) {
            loadQuestions(); // Load questions only after examId is set

            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(interval); // Cleanup the interval on unmount
        }
    }, [examId]);

      const handleAnswerChange = (questionId, answer) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: answer, // Map questionId to the selected option text
        }));
      };

    const loadQuestions = async () => {
        console.log("from load questions: "+examId);
        try {
            const response = await fetchExamQuestions(examId);
            setQuestions(response);
        } catch (err) {
            setError('Error loading questions.');
        }
    };

    const handleSubmit = async (payload) => {
        try {

            await submitExam(studentId, payload);
            alert('Exam submitted successfully.');
            window.location.href = '/student-login'; // Redirect after submission
        } catch (err) {
            setError('Failed to submit the exam.');
        }
    };

     const submitAnswers = () => {
        // Map answers to API structure
        const payload = Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer,
        }));
        handleSubmit(payload); // Pass the payload to the provided submit handler
      };

    return (
        <div className="exam-page">
          <h2>Exam</h2>
          <p className="timer">Time Remaining: {`${Math.floor(timer / 60)}:${timer % 60}`}</p>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                <p>{q.question}</p>
                <div className="options-container">
                  {q.choices.map((option, index) => (
                    <label key={index}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option}
                        onChange={() => handleAnswerChange(q.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <button onClick={submitAnswers} className="submit-button">
            Submit
          </button>
        </div>
      );
}

export default ExamPage;
