"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()
  const API_URL = "http://localhost:8001"

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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

      localStorage.setItem("accessToken", response.data.access)
      localStorage.setItem("username", credentials.username)

      alert("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please check your credentials.")
    }
  }

  const styles = {
    pageContainer: {
      width: "100%",
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr",
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: "hidden",
    },
    leftSide: {
      display: "none",
      backgroundColor: "#c4ede7",
      padding: "2rem",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
      opacity: isLoaded ? 1 : 0,
      transform: isLoaded ? "translateX(0)" : "translateX(-20px)",
    },
    leftContent: {
      maxWidth: "650px",
      margin: "0 auto",
      textAlign: "center",
    },
    illustration: {
      width: "700px",
      height: "450px",
      margin: "100px auto 0px",
      objectFit: "contain",
      transition: "transform 0.5s ease-in-out",
      animation: "bounce 0.75s infinite", 
    },
    leftTitle: {
      fontSize: "1.75rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "#1a3c34",
    },
    leftDescription: {
      fontSize: "1rem",
      color: "#1a3c34",
      marginBottom: "1.5rem",
      marginTop: "0rem",
      fontWeight: "500",
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
      backgroundColor: "#1a3c34",
      transition: "transform 0.3s ease",
      transform: isLoaded ? "scale(1)" : "scale(0)",
    },
    inactiveDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "rgba(26, 60, 52, 0.4)",
      transition: "transform 0.3s ease",
      transform: isLoaded ? "scale(1)" : "scale(0)",
      transitionDelay: "0.1s",
    },
    rightSide: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
      opacity: isLoaded ? 1 : 0,
      transform: isLoaded ? "translateX(0)" : "translateX(20px)",
    },
    formContainer: {
      width: "100%",
      maxWidth: "350px",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    logo: {
      fontSize: "1.75rem",
      fontFamily: '"Montserrat", "Segoe UI", sans-serif',
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: "#2D3748",
      letterSpacing: "0.5px",
    },
    welcomeText: {
      fontSize: "1.25rem",
      color: "#4B5563",
      fontWeight: "500",
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
      transition: "transform 0.3s ease, opacity 0.3s ease",
      transform: isLoaded ? "translateY(0)" : "translateY(10px)",
      opacity: isLoaded ? 1 : 0,
    },
    label: {
      fontSize: "0.875rem",
      color: "#4B5563",
      fontWeight: "500",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #D1D5DB",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    button: {
      width: "100%",
      backgroundColor: "#c4ede7",//"#4B5563",
      color: "#1a3c34",
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "0.5rem",
      marginLeft: "0.9rem",
      transition: "background-color 0.2s ease, transform 0.1s ease",
      transform: isLoaded ? "translateY(0)" : "translateY(10px)",
      opacity: isLoaded ? 1 : 0,
    },
    createAccount: {
      marginTop: "1.5rem",
      textAlign: "center",
      fontSize: "0.875rem",
      color: "#6B7280",
      transform: isLoaded ? "translateY(0)" : "translateY(10px)",
      opacity: isLoaded ? 1 : 0,
      transition: "transform 0.3s ease, opacity 0.3s ease",
      transitionDelay: "0.2s",
    },
    link: {
      color: "#4B5563",
      textDecoration: "none",
      fontWeight: "500",
      transition: "color 0.2s ease",
    },
  }

  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
    styles.pageContainer.gridTemplateColumns = "1fr 1fr"
    styles.leftSide.display = "flex"
  }

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}
      </style>
      <div style={styles.pageContainer}>
        <div style={styles.leftSide}>
          <div style={styles.leftContent}>
            <img
              src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg"
              alt="Pizza illustration"
              style={styles.illustration}
            />
            <h2 style={styles.leftTitle}>Service description</h2>
            <p style={styles.leftDescription}>More description</p>
          </div>
        </div>
        <div style={styles.rightSide}>
          <div style={styles.formContainer}>
            <div style={styles.header}>
              <h1 style={styles.logo}>Slice of Life</h1>
              <h2 style={styles.welcomeText}>Welcome!</h2>
            </div>

            <div style={styles.form}>
              <div style={{ ...styles.inputGroup, transitionDelay: "0.1s" }}>
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
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4B5563"
                    e.target.style.boxShadow = "0 0 0 2px rgba(75, 85, 99, 0.2)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <div style={{ ...styles.inputGroup, transitionDelay: "0.2s" }}>
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
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4B5563"
                    e.target.style.boxShadow = "0 0 0 2px rgba(75, 85, 99, 0.2)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <button
                style={{ ...styles.button, transitionDelay: "0.3s" }}
                onClick={login}
              >
                Sign in
              </button>

              <p style={styles.createAccount}>
                New Slicer?{" "}
                <a
                  href="#"
                  style={styles.link}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate("/signup")
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#1F2937"
                    e.target.style.textDecoration = "underline"
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#4B5563"
                    e.target.style.textDecoration = "none"
                  }}
                >
                  Create Account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login;




/* import { useState } from "react";
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
