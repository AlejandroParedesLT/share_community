"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const navigate = useNavigate() // Hook to navigate programmatically
  const API_URL = "http://localhost:8001"

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const login = async () => {
    try {
      const data = new URLSearchParams()
      data.append("username", credentials.username)
      data.append("password", credentials.password)

      const response = await axios.post(`${API_URL}/api/login/`, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      // Store access token and username
      localStorage.setItem("accessToken", response.data.access)
      localStorage.setItem("username", credentials.username)

      alert("Login successful!")

      // Redirect to Dashboard after successful login
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please check your credentials.")
    }
  }

  // Updated styles to match the Lovebirds design
  const styles = {
    pageContainer: {
      width: "100%",
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr",
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    leftSide: {
      display: "none", // Hidden on mobile
      backgroundColor: "#B5CCBE",
      color: "white",
      padding: "2rem",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    leftContent: {
      maxWidth: "400px",
      margin: "0 auto",
      textAlign: "center",
    },
    illustration: {
      width: "300px",
      height: "300px",
      margin: "0 auto 1.5rem",
      objectFit: "contain",
    },
    leftTitle: {
      fontSize: "1.5rem",
      fontWeight: "500",
      marginBottom: "1rem",
    },
    leftDescription: {
      fontSize: "0.875rem",
      opacity: "0.8",
      marginBottom: "1.5rem",
    },
    dotsContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "0.5rem",
      paddingTop: "1rem",
    },
    dot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "white",
    },
    inactiveDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    rightSide: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    },
    formContainer: {
      width: "100%",
      maxWidth: "320px",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    logo: {
      fontSize: "1.5rem",
      fontFamily: "cursive",
      marginBottom: "1.5rem",
    },
    welcomeText: {
      fontSize: "1.25rem",
      color: "#4B5563",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.875rem",
      color: "#6B7280",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #D1D5DB",
      borderRadius: "0.375rem",
      fontSize: "1rem",
    },
    button: {
      width: "100%",
      backgroundColor: "#4B5563",
      color: "white",
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "0.5rem",
    },
    createAccount: {
      marginTop: "1.5rem",
      textAlign: "center",
      fontSize: "0.875rem",
      color: "#6B7280",
    },
    link: {
      color: "#4B5563",
      textDecoration: "none",
      fontWeight: "500",
    },
    // Media query styles will be applied via JavaScript
  }

  // Apply media query styles for desktop
  if (window.innerWidth >= 1024) {
    styles.pageContainer.gridTemplateColumns = "1fr 1fr"
    styles.leftSide.display = "flex"
  }

  return (
    <div style={styles.pageContainer}>
      {/* Left side with illustration */}
      <div style={styles.leftSide}>
        <div style={styles.leftContent}>
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop"
            alt="Pizza illustration"
            style={styles.illustration}
          />
          <h2 style={styles.leftTitle}>Maecenas mattis egestas</h2>
          <p style={styles.leftDescription}>
            Eidum et malesuada fames ac ante ipsum primis in faucibus suspendisse porta
          </p>
          {/* Dots navigation */}
          <div style={styles.dotsContainer}>
            <div style={styles.dot}></div>
            <div style={styles.inactiveDot}></div>
            <div style={styles.inactiveDot}></div>
            <div style={styles.inactiveDot}></div>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h2 style={styles.welcomeText}>Welcome to Your Slice of Life!</h2>
          </div>

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="username">
                Email
              </label>
              <input
                style={styles.input}
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                Password
              </label>
              <input
                style={styles.input}
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            <button style={styles.button} onClick={login}>
              Sign in
            </button>

            <p style={styles.createAccount}>
              New Slicer?{" "}
              <a href="#" style={styles.link}>
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;


/*
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

export default Login; */
