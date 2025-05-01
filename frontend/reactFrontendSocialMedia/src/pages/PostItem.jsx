import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostItem() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8001";
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
            overflow: 'hidden',
            justifyContent: 'center',
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
            textAlign: "center",
            zIndex: 2,
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

    const pizzaImageUrl = "https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg";

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
            <style>
                {`
                    @keyframes floatSlow {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }

                    @keyframes floatAlt {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(15px); }
                        100% { transform: translateY(0px); }
                    }
                `}
            </style>

            {/* Left Top Pizza */}
            <div style={{
                position: 'absolute',
                left: '40px',
                top: '15%',
                width: '200px',
                height: '200px',
                animation: 'floatSlow 5s ease-in-out infinite',
                zIndex: 1
            }}>
                <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Left Bottom Pizza */}
            <div style={{
                position: 'absolute',
                left: '40px',
                bottom: '10%',
                width: '200px',
                height: '200px',
                animation: 'floatAlt 6s ease-in-out infinite',
                zIndex: 1
            }}>
                <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%' }} />
            </div>

            
            <div style={{
                position: 'absolute',
                right: '40px',
                top: '15%',
                width: '200px',
                height: '200px',
                animation: 'floatAlt 4.5s ease-in-out infinite',
                zIndex: 1
            }}>
                <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Right Bottom Pizza */}
            <div style={{
                position: 'absolute',
                right: '40px',
                bottom: '10%',
                width: '200px',
                height: '200px',
                animation: 'floatSlow 6.5s ease-in-out infinite',
                zIndex: 1
            }}>
                <img src={pizzaImageUrl} alt="Pizza" style={{ width: '100%', height: '100%' }} />
            </div>

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
