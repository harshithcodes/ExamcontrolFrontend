import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Auth.css";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "COE",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setMessage("Login successful! Redirecting...");
      console.log("response from Login.js: " + response);
      login(response.token, response.role, response.id);

      switch (response.role) {
        case "STUDENT":
          navigate("/student-dashboard");
          break;
        case "TEACHER":
          navigate("/teacher-dashboard");
          break;
        case "EXAM_CENTER":
          navigate("/exam-center-dashboard");
          break;
        case "COE":
          navigate("/coe-dashboard");
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage(error.message || "Error during login.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;
