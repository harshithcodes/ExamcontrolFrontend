//ds

import axios from 'axios';

// Set the base URL for all API requests
const API_BASE_URL = "https://project-backend.cfapps.us10-001.hana.ondemand.com/"; // Your Spring Boot server URL

var allNotificationIds = [];

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add an interceptor to attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  const id = localStorage.getItem("id");
  const examId = localStorage.getItem("examId");
  console.log('Api interceptor: ' + token + " Id: " + id + "Exam ID: " + examId);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);
    const { token, id } = response.data;
    localStorage.setItem("token", token); // Save token to localStorage
    localStorage.setItem("id", id);
    console.log(id);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get the list of available exams
export const getAvailableExams = async () => {
  try {
    const response = await api.get("/student/available-exams");
    console.log(response);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Register a student for an exam
export const registerForExam = async (examId, studentId) => {
  try {
    const response = await api.post("/student/register-exam", null, {
      params: { examId, studentId },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Fetch the list of exams the student is registered for
export const getRegisteredExams = async (studentId) => {
  try {
    const response = await api.get(`/student/exam-registrations/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};


// Get the list of students registered for an exam
export const getExamRegistrations = async (examId) => {
  try {
    const response = await api.get(`/student/exam-registrations/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Fetch the list of students for COE
export const getStudents = async () => {
  try {
    const response = await api.get("/coe/view-students");
    console.log("view-students: " + response);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Fetch the list of teachers for COE
export const getTeachers = async () => {
  try {
    const response = await api.get("/coe/view-teachers");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Create a new exam
export const createExam = async (examData) => {
    try {
        const response = await api.post("/coe/create-exam", examData);
        const { examId } = response.data;
        localStorage.setItem("examId", examId);
        console.log("Exam ID: " + examId);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Create an exam notification
export const createExamNotification = async (notificationDetails) => {
  const { notificationTitle, examDate, subjects, description } = notificationDetails;
  const examId = localStorage.getItem("examId");
  const subjectsList = subjects.split(',').map(subject => subject.trim());
  try {
    const response = await api.post(
      "/coe/create-exam-notification?examId="+examId,
      {
          notificationTitle,
          examDate,
          subjects: subjectsList,  // Pass as an array
          description
      }
    );
    localStorage.setItem("notificationIds",response.data.notificationIds);

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Function to fetch exam notification summary based on notification IDs
export const getExamNotificationSummary = async () => {
    try {
        const notificationIds = localStorage.getItem("notificationIds");
        const response = await api.get("/coe/exam-notification/summary?notificationIds="+notificationIds);
        return response.data;
    } catch (error) {
        console.error('Error fetching exam notification summary:', error);
        throw new Error('Failed to fetch exam summaries');
    }
};

// Fetch all teacher requests
export const fetchTeacherRequests = async () => {
    try {
        const response = await api.get("/coe/teacher-requests");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Approve a teacher request
export const approveTeacherRequest = async (notificationId,teacherId) => {
    try {
        const response = await api.post("/coe/approve-teacher/"+notificationId+"/"+teacherId);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Reject a teacher request
export const rejectTeacherRequest = async (notificationId,teacherId) => {
    try {
        const response = await api.post("coe/reject-teacher/"+notificationId + "/" + teacherId);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const viewResults = async (examId) => {
    try {
        const response = await api.get(
                    "coe/exam-rankings/"+examId
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Teacher dashboard api's

// Fetch exam notifications
export const fetchExamNotifications = async () => {
    try {
        const response = await api.post("teacher/view-notifications");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Teacher apply for a exam
export const applyExam = async (notificationId) => {
    try {
        const teacherId = localStorage.getItem("id");
        const response = await api.post("/teacher/apply-notification", null, {
              params: { notificationId, teacherId },
            });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const fetchApplyNotificationStatus = async () => {
    try {
        const teacherId = localStorage.getItem("id");
        const response = await api.get("/teacher/notification-status/"+teacherId);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Submit question paper
export const submitQuestionPaper = async (notificationId,questions) => {
    try {
    console.log("hi");
    const teacherId = localStorage.getItem("id");
        const response = await api.post(
                    `teacher/submit-question?notificationId=${notificationId}&teacherId=${teacherId}`,  // Endpoint URL
                    { questions }  // Request body (questions will be sent here)
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// View Papers set
export const viewPapersSet = async (examId) => {
    try {
        const examId = localStorage.getItem("examId");
        const response = await api.get(
                    "coe/view-papers-set/"+examId,  // Endpoint URL
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Finalize the paper
export const finalizePaper = async (examId,requestBody) => {
    try {
        const response = await api.post(
                    `coe/finalize-question-paper?examId=${examId}`,
                    { requestBody }
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Exam Center API

// get exam center details
export const getExamCenterDetails = async () => {
    try {
        const examCenterId = localStorage.getItem("id");
        const response = await api.get(
                    "exam-center/view-exam-center-details/"+examCenterId
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Fetch exams assigned to the exam centers
export const availableExams = async () => {
    try {
        const response = await api.get(
                    "exam-center/view-exams"
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// login student responds with all data of students
export const loginStudent = async (studentId, password, examId) => {
    try {
        const response = await api.post(
                    "exam-center/student-login/"+studentId+"/"+password+"/"+examId);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Fetch exam questions for that examId and studentID
export const fetchExamQuestions = async (examId) => {
    try {
        const response = await api.get(
                    "exam-center/exam-paper/"+examId
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Submit exam for exam id and student ID
export const submitExam = async (studentId, payload) => {
    try {
        const response = await api.post(
                    `exam-center/submit-exam?studentId=${studentId}`,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json', // Ensure the server understands the format
                    }},
                );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
