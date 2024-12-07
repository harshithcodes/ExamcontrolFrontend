import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Modal from './Modal';
import { getStudents, getTeachers, createExam, createExamNotification, getExamNotificationSummary, fetchTeacherRequests, approveTeacherRequest, rejectTeacherRequest, viewPapersSet, finalizePaper, viewResults } from '../api'; // Import the API function
import './COEDashboard.css';

function COEDashboard() {
    const { removeToken } = useAuth();
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [results, setResults] = useState([]);
    const [examDetails, setExamDetails] = useState({
                                                         title: "",
                                                         date: "",
                                                         subject: "",
                                                         totalMarks: "",
                                                         lastDateToApply: "",
                                                         instructions: "",
                                                     });
    const [notificationDetails, setNotificationDetails] = useState({
        notificationTitle: "",
        examDate: "",
        subjects: "", // Link to an exam
        description: "",
    });
    const [examSummaries, setExamSummaries] = useState([]);
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [papersSet, setPapersSet] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [difficulty, setDifficulty] = useState({
            easy: 50,    // Default ratio values
            medium: 40,
            hard: 30
        });
     const [totalQuestions, setTotalQuestions] = useState(4);
     // State for teacher data
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // Loader state for API calls

    // Fetch the exam notification summary when the component mounts
    useEffect(() => {
        fetchExamSummaries();
    }, []);

    // Fetch teacher requests
    const loadTeacherRequests = async () => {
            setLoading(true);
            try {
                const data = await fetchTeacherRequests();
                setRequests(data);
            } catch (error) {
                console.error("Error fetching teacher requests:", error);
            }finally {
                         setLoading(false); // Stop loader after data is fetched
            }
        };

    // Fetch papers set
    const loadPapersSet = async (examId) => {
        setLoading(true);
        try {
            const data = await viewPapersSet(examId);
            setPapersSet(data);
            setIsModalOpen(true);
        } catch (error) {
            alert(error);
            console.error("Error fetching papers set:", error);
        }finally {
             setLoading(false); // Stop loader after data is fetched
        }
    };

    //Fetch results
    const loadResults = async (examId) => {
            setLoading(true);
            try {
                const data = await viewResults(examId);
                setResults(data);
                setIsResultModalOpen(true);
            } catch (error) {
                alert(error);
                console.error("Error fetching results:", error);
            }finally {
                 setLoading(false); // Stop loader after data is fetched
            }
        };

    //Handle finalize paper
    const handleFinalize = async (examId) => {
            const requestBody = {
                        totalQuestions,
                        difficultyRatio: {
                            EASY: difficulty.easy,
                            MEDIUM: difficulty.medium,
                            HARD: difficulty.hard
                        }
            };
            setLoading(true);
            try {
                  await finalizePaper(examId,requestBody);
                  alert("Paper is finalized Successfully");
                  fetchExamSummaries();
                  closeModal();
            } catch (error) {
                console.error("Error fetching papers set:", error);
                alert(error);
            }finally {
                 setLoading(false); // Stop loader after data is fetched
            }
        };

    // Handle difficulty ratio change
        const handleDifficultyChange = (type, value) => {
            setDifficulty(prevState => ({
                ...prevState,
                [type]: value
            }));
        };

    // Handle total questions change
        const handleTotalQuestionsChange = (e) => {
            setTotalQuestions(e.target.value);
        };

    // Approve teacher request
    const handleApprove = async (requestId) => {
        setLoading(true);
        try {
            // Find the specific request by requestId from the requests array
            const requestToApprove = requests.find(req => req.requestId === requestId);

            if (requestToApprove) {
                // Call the approve API with the relevant details (e.g., notificationId, teacherId)
                await approveTeacherRequest(requestToApprove.notificationId, requestToApprove.teacherId);

                // Update the requests state to reflect the approved status
                setRequests((prevRequests) =>
                    prevRequests.map((req) =>
                        req.requestId === requestId ? { ...req, status: "approved" } : req
                    )
                );
                loadTeacherRequests();
            }
        } catch (error) {
            console.error("Error approving request:", error);
        } finally {
            setLoading(false); // Stop loader after processing
        }
    };

    // Reject teacher request
    const handleReject = async (requestId) => {
        setLoading(true); // Start loading
        try {
            // Find the specific request by requestId from the requests array
            const requestToReject = requests.find(req => req.requestId === requestId);

            if (requestToReject) {
                // Call the reject API with the relevant details (e.g., notificationId, teacherId)
                await rejectTeacherRequest(requestToReject.notificationId, requestToReject.teacherId);

                // Remove the rejected request from the requests list
                setRequests((prevRequests) =>
                    prevRequests.filter((req) => req.requestId !== requestId)
                );
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        } finally {
            setLoading(false); // Stop loading after processing
        }
    };


    // Function to fetch exam notification summary from API
    const fetchExamSummaries = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getExamNotificationSummary(); // Example notification IDs
                setExamSummaries(response.examSummaries); // Set the summaries data
            } catch (error) {
                setError('Failed to load exam summaries');
            } finally {
                setLoading(false);
            }
        };

    // Handle changes in the notification form
    const handleNotificationChange = (e) => {
        const { name, value } = e.target;
        setNotificationDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    // Handle API call for creating notification
    const handleCreateNotification = async () => {
        setLoading(true);
        try {
            const response = await createExamNotification(notificationDetails);
            alert(response.message);
            fetchExamSummaries();
            closeModal();
        } catch (error) {
            console.error("Error creating notification:", error);
            alert("Failed to create notification.");
        } finally {
            setLoading(false);
        }
    };

    // Open modal for specific functionality
    const openModal = (modalType) => {
        if (modalType === 'viewStudents') {
            fetchStudents(); // Fetch student data when opening "View Students"
        }
        if (modalType === 'viewTeachers') {
                    fetchTeachers(); // Fetch student data when opening "View Students"
                }
        if(modalType === 'approveTeachers'){
            loadTeacherRequests();
        }
        setActiveModal(modalType);
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setIsResultModalOpen(false);
        setActiveModal(null);
    };

    //Create exam functionality
    // Handle form input changes
    const handleChange = (e) => {
            const { name, value } = e.target;
            setExamDetails((prevDetails) => ({
                ...prevDetails,
                [name]: value,
            }));
        };

    // Handle Create Exam form submission
    const handleCreateExam = async () => {
            setLoading(true);
            try {
                const response = await createExam(examDetails); // Call the API
                alert(response.message);
                closeModal();
            } catch (error) {
                console.error("Error creating exam:", error);
                alert("Failed to create exam.");
            } finally {
                setLoading(false);
            }
        };

    // Fetch students using API function
    const fetchStudents = async () => {
        setLoading(true); // Show loader while fetching data
        try {
            const studentsData = await getStudents(); // Fetch students from API
            setStudents(studentsData); // Store students data in state
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false); // Stop loader after data is fetched
        }
    };

    const fetchTeachers = async () => {
            setLoading(true);
            try {
                const teachersData = await getTeachers();
                setTeachers(teachersData);
            } catch (error) {
                console.error('Error fetching teachers:', error);
            } finally {
                setLoading(false);
            }
        };

    const filteredTeachers = teachers.filter(teacher =>
             teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
         );

    // Filtered students based on the search term
    const filteredStudents = students.filter(student =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>COE Dashboard</h1>
            </header>

            <div className="tile-container">
                {/* Dashboard Tiles */}
                <div className="tile" onClick={() => openModal('createNotification')}>
                    <h3>Create Exam Notification</h3>
                    <p>Set up new exam notifications for teachers and students.</p>
                </div>
                <div className="tile" onClick={() => openModal('approveTeachers')}>
                    <h3>Approve Teachers</h3>
                    <p>Review and approve teacher requests for setting papers.</p>
                </div>
                <div className="tile" onClick={() => openModal('createExam')}>
                    <h3>Create Exam</h3>
                    <p>Finalize exam papers and schedule the exam.</p>
                </div>
                <div className="tile" onClick={() => openModal('viewStudents')}>
                    <h3>View Students</h3>
                    <p>Check all students registered for exams.</p>
                </div>
                <div className="tile" onClick={() => openModal('viewTeachers')}>
                    <h3>View Teachers</h3>
                    <p>Check all teachers registered for exams.</p>
                </div>

            </div>
            <header className="dashboard-header">
                            <h1>Active Exams </h1>
            </header>
            <div className="exam-summary-list">
                {examSummaries.length > 0 ? (
                    examSummaries.map((summary) => (
                        <div key={summary.examId} className="exam-summary-card">

                            <div className="title-container">
                                <h3>{summary.exam}</h3>
                            </div>

                            <p><strong>Exam Notification:</strong> {summary.examNotification}</p>
                            <p><strong>Exam ID:</strong> {summary.examId}</p>
                            <p><strong>No. of Students Registered:</strong> {summary.studentsRegistered}</p>
                            <p><strong>No. of Teachers Registered:</strong> {summary.teachersRegistered}</p>
                            <p><strong>Finalized Paper:</strong> {summary.finalizedPaper}</p>

                            <div className="view-papers-btn-container">
                                <button className="view-papers-button"
                                        onClick={() => loadPapersSet(summary.examId)}
                                        disabled = {summary.finalizedPaper === "Yes"}>

                                    {(summary.finalizedPaper === "No") ? "View Papers Set" : "Paper is set"}

                                </button>
                            </div>
                            <div className="view-papers-btn-container">
                                <button className="view-papers-button"
                                        onClick={() => loadResults(summary.examId)}
                                        >

                                    View Results

                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No Active exam notifications.</p>
                )}
            </div>

            {/* View Students Modal */}
            {activeModal === 'viewStudents' && (
                <Modal onClose={closeModal} title="View Students">
                    {loading ? (
                        <p>Loading students...</p>
                    ) : students.length > 0 ? (
                        <div className="student-modal">
                            <input
                                type="text"
                                className="search-bar"
                                placeholder="Search students by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="student-table-container">
                                <table className="student-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Grade</th>
                                            <th>Board</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id}>
                                                <td>{student.username}</td>
                                                <td>{student.grade}</td>
                                                <td>{student.board}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No students registered yet.</p>
                    )}
                </Modal>
            )}

            {/* View Teachers Modal */}
            {activeModal === 'viewTeachers' && (
                <Modal onClose={closeModal} title="View Teachers">
                    {loading ? (
                        <p>Loading teachers...</p>
                    ) : teachers.length > 0 ? (
                        <div className="teacher-modal">
                            <input
                                type="text"
                                className="search-bar"
                                placeholder="Search teachers by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="teacher-table-container">
                                <table className="teacher-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Department</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((teacher) => (
                                            <tr key={teacher.id}>
                                                <td>{teacher.username}</td>
                                                <td>{teacher.department}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No teachers registered yet.</p>
                    )}
                </Modal>
            )}

            {/* Create Exam Modal */}
            {activeModal === "createExam" && (
                <Modal onClose={closeModal} title="Create Exam">
                    {loading ? (
                        <p>Creating exam...</p>
                    ) : (
                        <form className="exam-form">
                            <label>
                                Title:
                                <input
                                    type="text"
                                    name="title"
                                    value={examDetails.title}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Date:
                                <input
                                    type="date"
                                    name="date"
                                    value={examDetails.date}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Subject:
                                <input
                                    type="text"
                                    name="subject"
                                    value={examDetails.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Total Marks:
                                <input
                                    type="number"
                                    name="totalMarks"
                                    value={examDetails.totalMarks}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Last Date to Apply:
                                <input
                                    type="date"
                                    name="lastDateToApply"
                                    value={examDetails.lastDateToApply}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Instructions:
                                <textarea
                                    name="instructions"
                                    value={examDetails.instructions}
                                    onChange={handleChange}
                                    required
                                    className="instruction-textbox"
                                />
                            </label>
                            <button type="button" onClick={handleCreateExam}>
                                Create Exam
                            </button>
                        </form>
                    )}
                </Modal>
                        )}

            {/*Create Notification Modal */}
            {activeModal === "createNotification" && (
                <Modal onClose={closeModal} title="Create Exam Notification">
                    {loading ? (
                        <p className="loading-text">Creating notification...</p>
                    ) : (
                        <form className="exam-form">
                            <label>
                                Enter notification title:
                                <input
                                    type="text"
                                    name="notificationTitle"
                                    value={notificationDetails.title}
                                    onChange={handleNotificationChange}
                                    required
                                />
                            </label>
                            <label>
                                Exam Date:
                                <input
                                    type="date"
                                    name="examDate"
                                    value={notificationDetails.examDate}
                                    onChange={handleNotificationChange}
                                    required
                                />
                            </label>
                            <label>
                                Subjects:
                                <input
                                    type="text"
                                    name="subjects"
                                    value={notificationDetails.subjects}
                                    onChange={handleNotificationChange}
                                    required
                                />
                            </label>
                           <label>
                               Description:
                               <textarea
                                   name="description"
                                   value={examDetails.description}
                                   onChange={handleNotificationChange}
                                   required
                                   className="instruction-textbox"
                               />
                           </label>
                           <button type="button" onClick={handleCreateNotification}>
                               Create Notification
                           </button>
                        </form>
                    )}
                </Modal>
            )}

            {/* View Teacher Requests Modal */}
            {activeModal === "approveTeachers" && (
                <Modal onClose={closeModal} title="Teacher Requests">
                    <>
                        {loading ? (
                            <p className="loading-text">Loading requests...</p>
                        ) : requests.length > 0 ? (
                            <div className="teacher-requests-modal">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Department</th>
                                            <th>Notification Title</th>
                                            <th>Exam Title</th>
                                            <th>Subjects</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.requestId}>
                                                <td>{request.teacherUsername}</td>
                                                <td>{request.teacherDepartment}</td>
                                                <td>{request.notificationTitle}</td>
                                                <td>{request.examTitle}</td>
                                                <td>{request.subjects}</td>
                                                <td>
                                                    {request.status === "APPROVED" ? (
                                                        <button className="btn btn-success" disabled>
                                                            Approved
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => handleApprove(request.requestId)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => handleReject(request.requestId)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No requests yet.</p>
                        )}
                    </>
                </Modal>
            )}

            {/* View Papers Modal */}
            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <>
                        {loading ? (
                            <p>Loading papers...</p>
                        ) : papersSet.length > 0 ? (
                            <div className="configure-paper-container">
                                {papersSet.map((paper, index) => (
                                    <div key={index} className="paper-section">
                                        <h2>Papers Set</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Teacher ID</th>
                                                    <th>Easy Questions</th>
                                                    <th>Medium Questions</th>
                                                    <th>Hard Questions</th>
                                                    <th>Total Questions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{paper.teacherId}</td>
                                                    <td>{paper.easyQuestions}</td>
                                                    <td>{paper.mediumQuestions}</td>
                                                    <td>{paper.hardQuestions}</td>
                                                    <td>{paper.totalQuestions}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="total-questions-container">
                                            <h3>Total Questions Set by All Teachers: {papersSet.reduce((sum, paper) => sum + paper.totalQuestions, 0)}</h3>
                                        </div>

                                        <h2>Configure Paper</h2>

                                        <div>
                                            <label>Total Questions:</label>
                                            <input
                                                type="number"
                                                value={totalQuestions}
                                                onChange={handleTotalQuestionsChange}
                                                min="1"
                                            />
                                        </div>

                                        <div>
                                            <label>Easy Questions (%)</label>
                                            <input
                                                type="number"
                                                value={difficulty.easy}
                                                onChange={(e) => handleDifficultyChange('easy', e.target.value)}
                                                min="0" max="100"
                                            />
                                        </div>

                                        <div>
                                            <label>Medium Questions (%)</label>
                                            <input
                                                type="number"
                                                value={difficulty.medium}
                                                onChange={(e) => handleDifficultyChange('medium', e.target.value)}
                                                min="0" max="100"
                                            />
                                        </div>

                                        <div>
                                            <label>Hard Questions (%)</label>
                                            <input
                                                type="number"
                                                value={difficulty.hard}
                                                onChange={(e) => handleDifficultyChange('hard', e.target.value)}
                                                min="0" max="100"
                                            />
                                        </div>

                                        <button onClick={() => handleFinalize(paper.examId)}>
                                            Finalize Paper
                                        </button>
                                    </div>
                                ))}
                            </div>

                        ) :(
                            <p>No papers yet.</p>
                        )}
                    </>
                </Modal>
            )}

             {/* View Results Modal */}
            {isResultModalOpen && (
                <Modal onClose={closeModal}>
                    <>
                        {loading ? (
                            <div className="loading-container">
                                <p className="loading-text">Loading results...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="results-table-container">
                                <h1 className="results-title">Results</h1>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Student Name</th>
                                            <th>Student ID</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result, index) => (
                                            <tr key={index}>
                                                <td className="rank">{index + 1}</td>
                                                <td className="student-name">{result.studentName}</td>
                                                <td className="student-id">{result.studentId}</td>
                                                <td className="score">{result.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="no-results">No results yet.</p>
                        )}
                    </>
                </Modal>
            )}
        </div>
    );
}

export default COEDashboard;
