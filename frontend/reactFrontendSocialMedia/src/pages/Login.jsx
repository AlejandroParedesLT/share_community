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

            // Store access token and username
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("username", credentials.username);
            
            alert("Login successful!");

            // Redirect to Dashboard after successful login
            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please check your credentials.");
        }
    };

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            maxWidth: '400px',
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            padding: '30px',
            textAlign: 'center',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1c1e21',
            marginBottom: '30px',
        },
        input: {
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: '1px solid #dddfe2',
            borderRadius: '8px',
            fontSize: '16px',
        },
        button: {
            width: '100%',
            backgroundColor: '#0095f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.3s ease',
        },
        buttonHover: {
            backgroundColor: '#0077cc',
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <h2 style={styles.title}>Login</h2>
                <input 
                    style={styles.input}
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    value={credentials.username} 
                    onChange={handleChange} 
                />
                <input 
                    style={styles.input}
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={credentials.password} 
                    onChange={handleChange} 
                />
                <button 
                    style={styles.button}
                    onClick={login}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = styles.button.backgroundColor;
                    }}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;
