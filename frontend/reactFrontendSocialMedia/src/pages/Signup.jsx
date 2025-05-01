"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    country: "",
  })
  const [countries, setCountries] = useState([])
  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
    const fetchCountries = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/countries/")
        const data = await response.json()
        setCountries(data.countries)
      } catch (err) {
        console.error("Error fetching countries:", err)
      }
    }
    fetchCountries()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const submissionData = { ...formData }
    if (!submissionData.country) delete submissionData.country

    try {
      const response = await fetch("http://localhost:8001/api/user/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })
      const data = await response.json()

      if (response.ok) {
        const loginResponse = await fetch("http://localhost:8001/api/login/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: formData.username,
            password: formData.password,
          }),
        })
        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          localStorage.setItem("accessToken", loginData.access)
          localStorage.setItem("refresh_token", loginData.refresh)
          localStorage.setItem("username", formData.username)

          navigate("/preferences")
        } else {
          setError("Signup successful, but auto-login failed. Please log in manually.")
        }
      } else {
        setError(data.message || "Signup failed")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
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
      fontWeight: "500",
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
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #D1D5DB",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      backgroundColor: "white",
    },
    button: {
      width: "100%",
      backgroundColor: "#c4ede7",
      color: "#1a3c34",
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "0.5rem",
    },
    errorMessage: {
      color: "#EF4444",
      textAlign: "center",
      marginBottom: "1rem",
      fontSize: "0.875rem",
    },
    loginText: {
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
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
      <div style={styles.pageContainer}>
        <div style={styles.leftSide}>
          <div style={styles.leftContent}>
            <img src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg" alt="Pizza illustration" style={styles.illustration} />
            <h2 style={styles.leftTitle}>Join Our Community!</h2>
            <p style={styles.leftDescription}>Create an account to connect with people like you and access personalized recommendations.</p>
          </div>
        </div>

        <div style={styles.rightSide}>
          <div style={styles.formContainer}>
            <div style={styles.header}>
              <h1 style={styles.logo}>Slice of Life</h1>
              <h2 style={styles.welcomeText}>Create Your Account</h2>
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <form style={styles.form} onSubmit={handleSubmit}>
              {/* username */}
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="username">Username</label>
                <input style={styles.input} type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
              </div>

              {/* email */}
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="email">Email</label>
                <input style={styles.input} type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              {/* password */}
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="password">Password</label>
                <input style={styles.input} type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>

              {/* bio */}
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="bio">Bio (optional)</label>
                <input style={styles.input} type="text" id="bio" name="bio" value={formData.bio} onChange={handleChange} />
              </div>

              {/* country */}
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="country">Country (optional)</label>
                <select style={styles.select} id="country" name="country" value={formData.country} onChange={handleChange}>
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <button style={styles.button} type="submit">Sign Up</button>

              <p style={styles.loginText}>
                Already have an account? {" "}
                <a href="#" style={styles.link} onClick={(e) => { e.preventDefault(); navigate("/home") }}>Login here</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup;
