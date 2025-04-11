import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostGenre() {
    const [name, setName] = useState(""); // Genre name
    const [createdAt, setCreatedAt] = useState(""); // Creation date of genre
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001"; // Adjust based on your backend
    const token = localStorage.getItem("accessToken");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if name and createdAt are provided
        if (!name || !createdAt) {
            alert("Please fill in all fields.");
            return;
        }

        const genreData = {
            name: name,
            createdAt: createdAt,  // Use created_at for consistency with backend
        };
    
        try {
            // POST request to backend API
            const response = await axios.post(`${API_URL}/api/genres/`, genreData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            alert("Genre posted successfully!");
            navigate("/view-genre"); // Navigate to the genre view page after posting
        } catch (error) {
            console.error("Error posting genre:", error);
            alert("Failed to post genre.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Post New Genre</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Genre Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Created At:</label>
                    <input
                        type="date"
                        value={createdAt}
                        onChange={(e) => setCreatedAt(e.target.value)} // Date in YYYY-MM-DD format
                        required
                    />
                </div>
                <button type="submit" style={{ padding: "10px 15px", cursor: "pointer" }}>
                    Submit Genre
                </button>
            </form>
        </div>
    );
}

export default PostGenre;
