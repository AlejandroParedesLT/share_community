import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostPost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [items, setItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
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
            fontFamily: 'Arial', //'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
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
            //border: "1px solid #dddfe2",
            borderRadius: "12px",
            padding: "40px",
            //boxShadow: "0 6px 8px rgba(0,0,0,0.1)",
            maxHeight: '90vh',
            overflowY: 'auto',
            marginTop: '20px',
            // Centering styles
            display: "flex",
            flexDirection: "column", // Align items in a column
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            textAlign: "center" // Ensures text alignment is centered
        },
        createAccount: {
            marginTop: "0rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#6B7280",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transitionDelay: "0.2s",
        },
        navBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#c4ede7',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '100%',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        },
        navLeft: {
            display: 'flex',
            alignItems: 'center', 
            gap: '15px',
        },
        navLogo: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            objectFit: 'contain',
            transition: "transform 0.5s ease-in-out",
            animation: "bounce 0.75s infinite",
        },
        navText: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1c1e21',
        },
        navRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        backButton: {
            width: '120px',
            padding: '10px 0px',
            backgroundColor: '#3c413a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            textAlign: 'center',
            whiteSpace: 'nonwrap',
        },
        textarea: {
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
            resize: 'vertical',
            position: 'relative',
            fontFamily: "Arial",
            //border: "2px solid #D1D5DB",
            borderRadius: "0.375rem",
            fontSize: "1rem",
        },
        fileInput: {
            display: 'none',
        },
        uploadButton: {
            display: 'inline-block',  // Only as wide as its content
            padding: '10px 15px', // Adjust padding for better sizing
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
        select: {
            width: "calc(100% - 30px)",
            padding: "15px", 
            marginBottom: "25px", 
            marginLeft: '15px', 
            marginRight: '15px', 
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            fontSize: "16px",
            color: 'black',
            fontFamily: "Arial",
            backgroundColor: 'white',
            appearance: 'none',
            boxSizing: 'border-box',
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'white\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
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
        },
        
    };

    useEffect(() => {
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
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title) {
            alert("Please fill in the title.");
            return;
        }
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
    
        // Append multiple `items`
        items.forEach((item) => {
            formData.append('items', item.precordsid.toString());
        });
    
        if (image) {
            formData.append("image", image);
        }
    
        console.log("Submitting form data:", Object.fromEntries(formData.entries()));
    
        try {
            const response = await axios.post(`${API_URL}/api/posts/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Post created successfully!");
            navigate("/posts");
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

    return (
        <div style={styles.pageContainer}>
            {/* Add this style tag if you don't want to create a separate CSS file */}
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .bouncing-logo {
                    animation: bounce 0.75s infinite;
                }
                `}
            </style>
            
            <div style={styles.container}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '30px', 
                    color: '#1c1e21',
                    fontSize: '20px',
                    fontWeight: '550',
                }}>
                    Share Something You've Read, Listened to, Or Watched Lately!
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title Your Post"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={styles.textarea}
                    />
                    <textarea
                        placeholder="What's on Your Mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={styles.textarea}
                        rows="4"
                    />
                    
                    <input
                        type="file"
                        onChange={handleImageChange}
                        style={styles.fileInput}
                        id="fileInput"
                        accept="image/*"
                    />
                    <label htmlFor="fileInput" style={styles.uploadButton}>
                        {image ? image.name : "Attach an Image to Your Post"}
                    </label>

                    <select 
                        style={styles.select}
                        onChange={(e) => handleItemSelect(e.target.value)}
                    >
                        <option value="" style={{backgroundColor: 'black', color: 'white'}}>
                            Attach an item...
                        </option>
                        {availableItems
                            .filter(item => !items.some(addedItem => addedItem.precordsid === item.precordsid))
                            .map(item => (
                                <option 
                                    key={item.precordsid} 
                                    value={item.precordsid}
                                    style={{backgroundColor: 'black', color: 'white'}}
                                >
                                    {item.title}
                                </option>
                            ))
                        }
                    </select>

                    {items.length > 0 && (
                        <div style={{
                            marginBottom: '25px',
                            marginLeft: '15px', 
                            marginRight: '15px', 
                        }}>
                            <h3 style={{ 
                                fontSize: "18px", 
                                marginBottom: "20px",
                                color: 'black',
                                fontWeight: '600'
                            }}>
                                Added Items
                            </h3>
                            {items.map((item, index) => (
                                <div key={item.precordsid} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px', 
                                    border: '1px solid black',
                                    borderRadius: '8px',
                                    marginBottom: '15px', 
                                    backgroundColor: 'black',
                                }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '16px',
                                        color: 'white',
                                    }}>
                                        {item.title}
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(index)}
                                        style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            border: 'none',
                                            padding: '10px 15px', 
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p style={styles.createAccount}>
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
                            Create Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostPost;