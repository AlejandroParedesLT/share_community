import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Items() {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001"; // Adjust based on your backend
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchItems();
        }
    }, [token]);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/items/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            alert("Failed to fetch items.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Items List</h2>
            <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px", padding: "10px 15px", cursor: "pointer" }}>
                Back to Dashboard
            </button>

            {items.length === 0 ? (
                <p>Loading items...</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {items.map((item) => (
                        <li key={item.precordsid} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                            <h3>{item.title}</h3>
                            <p><strong>Publish Date:</strong> {new Date(item.publish_date).toLocaleDateString()}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            <p><strong>Created At:</strong> {new Date(item.created_at).toLocaleString()}</p>
                            {/* <p><strong>Type:</strong> {item.type}</p>
                            <p><strong>Genre:</strong> {item.genre}</p> */}
                            {item.presigned_image_url && <img src={item.presigned_image_url} alt={item.title} width="200" />}
                            {item.image && (
                                <div>
                                    <h4>Image:</h4>
                                    <img src={item.image} alt={item.title} width="200" />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Items;
