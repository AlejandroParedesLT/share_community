import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PostPostModal from "./PostPost";

function MyProfile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newBio, setNewBio] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");
    const [isModalOpen, setModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const avatarColors = [
        '#0095f6', '#5B4FD8', '#E1306C', '#FF6B6B', '#4ECDC4',
        '#45B7D1', '#F9D56E', '#FF8C42', '#6A5ACD', '#2A9D8F',
    ];

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#fdfffc',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflowY: 'auto',
            padding: '0',
            boxSizing: 'border-box',
        },
        dropdownMenu: {
            position: 'absolute',
            right: 0,
            color: 'black',
            top: 'calc(100% + 5px)',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
            zIndex: 200,
        },
        dropdownItem: {
            padding: '10px 20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
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
            gap: '10px',
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
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '550',
            color: '#1c1e21',
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
        navRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        profileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '50px',
        },
        avatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0095f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '30px',
            fontWeight: 'bold',
        },
        profilePicture: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
        },
        details: {
            fontSize: '16px',
            color: '#1c1e21',
        },
        editIcon: {
            marginLeft: '8px',
            cursor: 'pointer',
            fontSize: '16px',
        },
        inputField: {
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
        },
        saveButton: {
            marginLeft: '5px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: '#3c413a',
            color: 'white',
        },
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
        },
        postCard: {
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease',
        },
        postCardHover: {
            transform: 'scale(1.02)',
        },
        postImage: {
            width: '100%',
            height: '250px',
            objectFit: 'cover',
        },
        postContent: {
            padding: '20px',
        },
        postTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1c1e21',
        },
        postMeta: {
            fontSize: '14px',
            color: '#65676b',
            marginBottom: '15px',
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
        },
        userAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
        },
        postText: {
            color: '#1c1e21',
            marginBottom: '15px',
        },
        noPostsMessage: {
            textAlign: 'center',
            color: '#65676b',
            fontSize: '18px',
            marginTop: '50px',
        },
        associatedItemsTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1c1e21',
        },
        associatedItemHover: {
            transform: 'scale(1.05)',
        },
        associatedItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'black',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
            transition: 'transform 0.3s ease',
        },
        associatedItemImage: {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '8px',
        },
        recentPostsHeader: {
            fontSize: '24px',
            fontWeight: '550',
            color: '#1c1e21',
            marginBottom: '20px',
            borderBottom: '2px solid #ddd',
            paddingBottom: '10px',
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchUserProfile();
        }
    }, [token, navigate, id]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(response.data.data);
            setUsername(response.data.data.username);
            setBio(response.data.data.bio || '');
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Failed to load user profile.");
        }
    };

    const handleUsernameUpdate = async () => {
        try {
            await axios.put(`${API_URL}/api/user/`,
                { username: newUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsername(newUsername);
            setIsEditingUsername(false);
        } catch (error) {
            console.error("Error updating username:", error);
            alert("Failed to update username.");
        }
    };

    const handleBioUpdate = async () => {
        try {
            await axios.put(`${API_URL}/api/user/`,
                { bio: newBio },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBio(newBio);
            setIsEditingBio(false);
        } catch (error) {
            console.error("Error updating bio:", error);
            alert("Failed to update bio.");
        }
    };

    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        navigate("/home");
    };

    return (
        <div style={styles.pageContainer}>
            <style>
                {`@keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .bouncing-logo {
                    animation: bounce 0.75s infinite;
                }`}
            </style>

            <PostPostModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                navigate={navigate}
            />

            <div style={styles.navBar}>
                <div style={styles.navLeft}>
                    <img src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg" alt="Logo" style={styles.navLogo} className='bouncing-logo' />
                    <span style={styles.navText}>Slice of Life</span>
                </div>
                <div style={styles.navRight}>
                    <button onClick={() => setModalOpen(true)} style={styles.backButton}>Make Post!</button>
                    <button onClick={() => navigate("/posts")} style={styles.backButton}>Your Feed</button>
                    <button onClick={() => navigate("/dashboard")} style={styles.backButton}>Home</button>

                    <div style={{ position: 'relative' }}>
                        <img
                            src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAyL3BmLWljb240LWppcjIwNjQtcG9yLTAzLWxjb3B5LnBuZw.png"
                            alt="Account"
                            onClick={toggleDropdown}
                            style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            objectFit: 'cover',
                            padding: '2px',
                            }}
                        />
                        {dropdownOpen && (
                            <div style={styles.dropdownMenu}>
                                <div 
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate("/profile/me"); // Update with actual user ID if needed
                                    }} 
                                    style={styles.dropdownItem}
                                >
                                    My Profile
                                </div>
                                <div
                                    style={styles.dropdownItem}
                                    onClick={handleSignOut}
                                    >
                                    Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Slicer Profile</h2>
                </div>

                {user ? (
                    <div style={styles.profileInfo}>
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" style={styles.profilePicture} />
                        ) : (
                            <div style={styles.avatar}>
                                {user.username ? user.username[0].toUpperCase() : '?'}
                            </div>
                        )}
                        <div style={styles.details}>
                            <div>
                                <strong>Username:</strong>
                                {isEditingUsername ? (
                                    <>
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            style={styles.inputField}
                                        />
                                        <button onClick={handleUsernameUpdate} style={styles.saveButton}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ marginLeft: '10px' }}>{username}</span>
                                        <span
                                            onClick={() => {
                                                setNewUsername(username);
                                                setIsEditingUsername(true);
                                            }}
                                            style={styles.editIcon}
                                            title="Edit username"
                                        >✏️</span>
                                    </>
                                )}
                            </div>

                            <div>
                                <strong>About Me:</strong>
                                {isEditingBio ? (
                                    <>
                                        <input
                                            type="text"
                                            value={newBio}
                                            onChange={(e) => setNewBio(e.target.value)}
                                            style={styles.inputField}
                                        />
                                        <button onClick={handleBioUpdate} style={styles.saveButton}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ marginLeft: '10px' }}>{bio || 'No bio available'}</span>
                                        <span
                                            onClick={() => {
                                                setNewBio(bio);
                                                setIsEditingBio(true);
                                            }}
                                            style={styles.editIcon}
                                            title="Edit bio"
                                        >✏️</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading profile...</p>
                )}

                {/* Recent Posts Header */}
                <div style={styles.recentPostsHeader}>
                    Recent Posts
                </div>

                {posts.length === 0 ? (
                    <div style={styles.noPostsMessage}>
                        No posts found or loading...
                    </div>
                ) : (
                    <div style={styles.gridContainer}>
                        {posts.map((post) => {
                            const { initials, color } = getInitialsAndColor(post.user?.username || 'Unknown');

                            return (
                                <div 
                                    key={post.id} 
                                    style={styles.postCard}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = styles.postCardHover.transform;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {post.presigned_image_url && (
                                        <img 
                                            src={post.presigned_image_url} 
                                            alt={post.title} 
                                            style={styles.postImage}
                                        />
                                    )}
                                    
                                    <div style={styles.postContent}>
                                        {/* User Information */}
                                        <div style={styles.userInfo}>
                                            <div 
                                                style={{
                                                    ...styles.userAvatar, 
                                                    backgroundColor: color
                                                }}
                                            >
                                                {initials}
                                            </div>
                                            <div>
                                                <p style={{margin: 0, fontWeight: 'bold', fontSize: '14px'}}>
                                                    {post.user?.username || 'Unknown User'}
                                                </p>
                                            </div>
                                        </div>

                                        <h3 style={styles.postTitle}>{post.title}</h3>
                                        <p style={styles.postMeta}>
                                            Created on: {new Date(post.created_at).toLocaleString()}
                                        </p>
                                        
                                        {post.content && (
                                            <p style={styles.postText}>{post.content}</p>
                                        )}
                                        {post.items && post.items.length > 0 && (
                                            <div>
                                                <h4 style={styles.associatedItemsTitle}>
                                                    Associated Items:
                                                </h4>
                                                {post.items.map((item) => (
                                                    <div 
                                                        key={item.precordsid} 
                                                        style={styles.associatedItem}
                                                        onClick={() => navigate(`/view-item/${item.precordsid}`)} // Redirect to view-item with precordsid
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = styles.associatedItemHover.transform;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <span>{item.title}</span>
                                                        {item.presigned_image_url && (
                                                            <img 
                                                                src={item.presigned_image_url} 
                                                                alt={item.title} 
                                                                style={styles.associatedItemImage}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyProfile;
