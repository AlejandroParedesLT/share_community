import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const navigate = useNavigate(); // Hook to navigate programmatically
    const API_URL = "http://localhost:8001";

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const login = async () => {
        try {
            const data = new URLSearchParams();
            data.append("username", credentials.username);
            data.append("password", credentials.password);

            const response = await axios.post(`${API_URL}/api/login/`, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            localStorage.setItem("accessToken", response.data.access);
            alert("Login successful!");

            // 🔥 Redirect to Dashboard after successful login
            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Login Page</h2>
            <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={credentials.username} 
                onChange={handleChange} 
            />
            <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={credentials.password} 
                onChange={handleChange} 
            />
            <button onClick={login}>Login</button>
        </div>
    );
}

export default Login;
