"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Preferences = () => {
  const [preferences, setPreferences] = useState({
    favorite_genres: "",
    favorite_authors: "",
    favorite_movies: "",
    favorite_books: "",
    favorite_music: "",
  })

  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("") // Clear previous errors

    const accessToken = localStorage.getItem("accessToken")

    try {
      const response = await axios.post(
        "http://localhost:8001/api/preferences/",
        {
          favorite_genres: preferences.favorite_genres,
          favorite_authors: preferences.favorite_authors,
          favorite_movies: preferences.favorite_movies,
          favorite_books: preferences.favorite_books,
          favorite_music: preferences.favorite_music,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status === 201) {
        navigate("/dashboard")
      }
    } catch (err) {
      console.error(err.response?.data || err.message)
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
      backgroundColor: "#c4ede7",
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
    errorMessage: {
      color: "#EF4444",
      textAlign: "center",
      marginBottom: "1rem",
      fontSize: "0.875rem",
    },
  }

  // Apply media query styles for desktop
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
            <h2 style={styles.leftTitle}>Set Your Preferences</h2>
            <p style={styles.leftDescription}>Tell us what you like so we can provide better recommendations!</p>
          </div>
        </div>
        <div style={styles.rightSide}>
          <div style={styles.formContainer}>
            <div style={styles.header}>
              <h1 style={styles.logo}>Slice of Life</h1>
              <h2 style={styles.welcomeText}>Set Your Preferences</h2>
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <div style={styles.form}>
              <div style={{ ...styles.inputGroup, transitionDelay: "0.1s" }}>
                <label style={styles.label} htmlFor="favorite_genres">
                  Favorite Genres
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="favorite_genres"
                  name="favorite_genres"
                  value={preferences.favorite_genres}
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
                <label style={styles.label} htmlFor="favorite_authors">
                  Favorite Authors
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="favorite_authors"
                  name="favorite_authors"
                  value={preferences.favorite_authors}
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

              <div style={{ ...styles.inputGroup, transitionDelay: "0.3s" }}>
                <label style={styles.label} htmlFor="favorite_movies">
                  Favorite Movies
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="favorite_movies"
                  name="favorite_movies"
                  value={preferences.favorite_movies}
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

              <div style={{ ...styles.inputGroup, transitionDelay: "0.4s" }}>
                <label style={styles.label} htmlFor="favorite_books">
                  Favorite Books
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="favorite_books"
                  name="favorite_books"
                  value={preferences.favorite_books}
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

              <div style={{ ...styles.inputGroup, transitionDelay: "0.5s" }}>
                <label style={styles.label} htmlFor="favorite_music">
                  Favorite Music
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="favorite_music"
                  name="favorite_music"
                  value={preferences.favorite_music}
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
                style={{ ...styles.button, transitionDelay: "0.6s" }}
                type="submit"
                onClick={handleSubmit}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#b3e5de"
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#c4ede7"
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Preferences;
