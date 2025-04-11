import React, { useState } from "react";
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

export default Preferences;
