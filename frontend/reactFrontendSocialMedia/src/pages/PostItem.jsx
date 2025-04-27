import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostItem() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001"; // Adjust as needed
    const token = localStorage.getItem("accessToken");

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#c4ede7',
            fontFamily: 'Arial',
            margin: 0,
            paddingTop: '0px',
            boxSizing: 'border-box',
            overflow: 'auto',
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
        },
        container: {
            width: "100%",
            maxWidth: "600px",
            backgroundColor: 'white',
            borderRadius: "12px",
            padding: "40px",
            maxHeight: '90vh',
            overflowY: 'auto',
            marginTop: '20px',
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
        },
        input: {
            width: "calc(100% - 30px)",
            padding: "15px",
            marginBottom: "20px",
            marginLeft: '15px',
            marginRight: '15px',
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            fontSize: "16px",
            color: 'black',
            backgroundColor: 'white',
            boxSizing: 'border-box',
            fontFamily: "Arial",
        },
        fileInput: {
            display: 'none',
        },
        uploadButton: {
            display: 'inline-block',
            padding: '10px 15px',
            backgroundColor: '#3c413a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            marginTop: '2.5px',
            marginBottom: '25px',
            textAlign: 'center'
        },
        button: {
            width: "calc(100% - 30px)",
            padding: '15px',
            backgroundColor: '#3c413a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            marginTop: '10px',
            marginLeft: '15px',
            marginRight: '15px',
            boxSizing: 'border-box',
        }
    };

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
            await axios.post(`${API_URL}/api/items/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Item posted successfully!");
            navigate("/items");
        } catch (error) {
            console.error("Error posting item:", error);
            alert("Failed to post item.");
        }
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        setImage(selectedFile);
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '0px',
                    color: '#1c1e21',
                    fontSize: '20px',
                    fontWeight: '550',
                }}>
                    Suggest a New Item to Us
                </h2>
                <h3 style={{
                    textAlign: 'center',
                    marginBottom: '10px',
                    color: '#1c1e21',
                    fontSize: '15px',
                    fontWeight: '550',
                }}>
                    We'll add it to our item catalog!
                </h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Item Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <textarea
                        placeholder="Item Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.input}
                        rows="4"
                        required
                    />
                    <input
                        placeholder="Publish Date"
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        required
                        style={styles.input}
                    />

                    <input
                        type="file"
                        onChange={handleImageChange}
                        style={styles.fileInput}
                        id="fileInput"
                        accept="image/*"
                    />
                    <label htmlFor="fileInput" style={styles.uploadButton}>
                        {image ? image.name : "Attach an Image"}
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                        <button
                            type="button"
                            style={{ ...styles.button, width: 'auto', flex: 1 }}
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ ...styles.button, width: 'auto', flex: 1 }}
                        >
                            Submit Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostItem;
