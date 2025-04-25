import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostItem() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001"; // Adjust based on your backend
    const token = localStorage.getItem("accessToken");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !publishDate) {
            alert("Please fill in all fields.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("publish_date", publishDate);
        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${API_URL}/api/items/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Item posted successfully!");
            navigate("/items"); // Navigate to the list of items after posting
        } catch (error) {
            console.error("Error posting item:", error);
            alert("Failed to post item.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Post New Item</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Publish Date:</label>
                    <input
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Image:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit" style={{ padding: "10px 15px", cursor: "pointer" }}>
                    Submit Item
                </button>
            </form>
        </div>
    );
}

export default PostItem;
