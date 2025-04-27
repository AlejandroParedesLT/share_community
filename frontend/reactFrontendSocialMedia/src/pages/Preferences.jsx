"use client"

import { useState } from "react"
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
  const navigate = useNavigate()

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

  // Styles matching the Login.jsx theme
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
      maxWidth: "400px", // Slightly wider for preferences form
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
    errorMessage: {
      color: "#EF4444",
      textAlign: "center",
      marginBottom: "1rem",
      fontSize: "0.875rem",
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
            src="https://helloartsy.com/wp-content/uploads/kids/food/how-to-draw-a-cute-pizza/how-to-draw-a-cute-pizza-step-6.jpg"
            alt="Pizza illustration"
            style={styles.illustration}
          />
          <h2 style={styles.leftTitle}>Set Your Preferences</h2>
          <p style={styles.leftDescription}>Tell us what you like so we can provide better recommendations!</p>
        </div>
      </div>

      {/* Right side with preferences form */}
      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h1 style={styles.logo}>Slice of Life</h1>
            <h2 style={styles.welcomeText}>Set Your Preferences</h2>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
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
              />
            </div>

            <div style={styles.inputGroup}>
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
              />
            </div>

            <div style={styles.inputGroup}>
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
              />
            </div>

            <div style={styles.inputGroup}>
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
              />
            </div>

            <div style={styles.inputGroup}>
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
              />
            </div>

            <button style={styles.button} type="submit">
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Preferences;


/* import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Preferences = () => {
    const [preferences, setPreferences] = useState({
        favorite_genres: "",
        favorite_authors: "",
        favorite_movies: "",
        favorite_books: "",
        favorite_music: "",
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setPreferences({ ...preferences, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
    
        const accessToken = localStorage.getItem("accessToken");
    
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
                }
            );
    
            if (response.status === 201) {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err.response?.data || err.message);
            setError("Something went wrong. Please try again.");
        }
    };
    

    return (
        <div>
            <h2>Set Your Preferences</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="favorite_genres"
                    placeholder="Favorite Genres"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="favorite_authors"
                    placeholder="Favorite Authors"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="favorite_movies"
                    placeholder="Favorite Movies"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="favorite_books"
                    placeholder="Favorite Books"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="favorite_music"
                    placeholder="Favorite Music"
                    onChange={handleChange}
                />
                <button type="submit">Save Preferences</button>
            </form>
        </div>
    );
}; 

export default Preferences; */