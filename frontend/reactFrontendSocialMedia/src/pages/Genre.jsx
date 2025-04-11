import { useState, useEffect } from "react";
import axios from "axios";

function Genre() {
    const [genres, setGenres] = useState([]);
    const API_URL = "http://localhost:8001"; // Adjust based on your backend API
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/genres/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setGenres(response.data);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };

        fetchGenres();
    }, [token]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>View Genres</h2>
            {genres.length > 0 ? (
                <ul>
                    {genres.map((genre) => (
                        <li key={genre.id}>
                            <strong>{genre.name}</strong>
                            {/* - Created At: {new Date(genre.created_at).toLocaleString()} */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No genres available.</p>
            )}
        </div>
    );
}

export default Genre;
