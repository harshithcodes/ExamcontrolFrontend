import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // For improved styling

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "STUDENT",
    grade: "",
    board: "",
    department: "",
    centerName: "",
    centerCode: "",
    address: "",
    city: "",
    state: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setMessage("Registration successful! Redirecting to Login...");
      // Store role in localStorage
      localStorage.setItem("role", formData.role);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.message || "Error during registration.");
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.role) {
      case "STUDENT":
        return (
          <>
            <input
              type="text"
              name="grade"
              placeholder="Grade"
              value={formData.grade}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="board"
              placeholder="Board"
              value={formData.board}
              onChange={handleChange}
              required
            />
          </>
        );
      case "TEACHER":
        return (
          <>
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </>
        );
      case "EXAM_CENTER":
        return (
          <>
            <input
              type="text"
              name="centerName"
              placeholder="Center Name"
              value={formData.centerName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="centerCode"
              placeholder="Center Code"
              value={formData.centerCode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="EXAM_CENTER">Exam Center</option>
          <option value="COE">COE</option>
        </select>

        {/* Render additional fields based on the selected role */}
        {renderAdditionalFields()}

        <button type="submit">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;
