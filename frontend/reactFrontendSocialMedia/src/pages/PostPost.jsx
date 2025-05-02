import { useState, useEffect } from "react";
import axios from "axios";

function PostPostModal({ isOpen, onClose, navigate }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [items, setItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (!isOpen) return; // only fetch if modal is open
        const fetchItems = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/items/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAvailableItems(response.data);
            } catch (error) {
                console.error("Error fetching items:", error);
                alert("Failed to fetch items.");
            }
        };
        fetchItems();
    }, [isOpen, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            alert("Please fill in the title.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        items.forEach((item) => {
            formData.append('items', item.precordsid.toString());
        });
        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${API_URL}/api/posts/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Post created successfully!");
            navigate("/posts");
            onClose(); // close modal after success
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post.");
        }
    };

    const handleItemSelect = (selectedItemId) => {
        const selectedItem = availableItems.find(item => item.precordsid.toString() === selectedItemId);
        if (selectedItem && !items.some(item => item.precordsid === selectedItem.precordsid)) {
            setItems(prevItems => [...prevItems, selectedItem]);
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        setImage(selectedFile);
    };

    if (!isOpen) return null; // if not open, render nothing

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            marginBottom: '0px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
            }}>
                {/* Close button */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-15px',
                        background: 'transparent',
                        color: 'black',
                        border: 'none',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                {/* Form Content */}
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1c1e21',
                    fontSize: '20px',
                    fontWeight: '550', }}>
                    Share Something You've Read, Listened to, Or Watched!
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title Your Post"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px", backgroundColor: 'white', marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc" , fontFamily: "Arial",}}
                    />
                    <textarea
                        placeholder="What's on Your Mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="4"
                        style={{ width: "100%", padding: "10px",backgroundColor: 'white', fontFamily: 'Arial', marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                    <div style={{
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        marginBottom: '15px', 
                    }}>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    <label htmlFor="fileInput" style={{
                        display: 'inline-block',
                        backgroundColor: '#3c413a',
                        padding: '10px',
                        cursor: 'pointer',
                        marginBottom: '15px',
                        textAlign: 'center',
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: '600',
                        color: 'white',
                        fontFamily: "Arial",
                        width: 'auto'

                    }}>
                        {image ? image.name : "Attach an Image to Your Post"}
                    </label>
                    </div>

                    <select 
                        onChange={(e) => handleItemSelect(e.target.value)}
                        style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc" , fontSize: "16px",
                            
                            fontFamily: "Arial",
                            backgroundColor: 'white',
                            color: 'gray',
                            appearance: 'none',
                            boxSizing: 'border-box',
                            backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'white\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center',}}
                    >
                        <option value="">Select an item...</option>
                        {availableItems
                            .filter(item => !items.some(addedItem => addedItem.precordsid === item.precordsid))
                            .map(item => (
                                <option key={item.precordsid} value={item.precordsid}>
                                    {item.title}
                                </option>
                            ))
                        }
                    </select>

                    {items.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <h4>Added Items:</h4>
                            {items.map((item, index) => (
                                <div key={item.precordsid} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    color: 'black',
                                    border: "1px solid #ccc" ,
                                }}>
                                    <span>{item.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        style={{
                                            backgroundColor: '#3c413a',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p style={{
                        marginTop: "0rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        transition: "transform 0.3s ease, opacity 0.3s ease",
                        transitionDelay: "0.2s"}}>
                Don't see an item you're looking for?{" "}
                <a
                  href="#"
                  color="#4B5563"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate("/post-item")
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#4B5563"
                    e.target.style.textDecoration = "underline"
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#4B5563"
                    e.target.style.textDecoration = "none"
                  }}
                >
                  Suggest it to us here
                </a>
              </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <button 
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                backgroundColor: '#ccc',
                                color: 'black',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            style={{
                                flex: 1,
                                backgroundColor: '#3c413a', //'#c4ede7',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            Create Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostPostModal;
