import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PostPostModal from "./PostPost";


function Profile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);  // State for posts
    const navigate = useNavigate();
    const { id } = useParams();
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");
    const [isModalOpen, setModalOpen] = useState(false);


    // Color palette for avatars
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
            //marginBottom: '20px',
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
            justifyContent: 'space-between',  // Ensure items are spaced out
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
            fetchUserPosts();  // Fetch posts after the profile
        }
    }, [token, navigate, id]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user/?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Failed to load user profile.");
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/posts?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // Log the response to inspect its structure
            console.log("Response Data:", response.data);
    
            // Access posts from the 'results' array
            const postsData = response.data.results || [];
    
            // Ensure postsData is an array
            if (Array.isArray(postsData)) {
                // Sort posts in reverse chronological order
                const sortedPosts = postsData.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setPosts(sortedPosts);
            } else {
                console.error("Posts data is not an array:", postsData);
            }
        } catch (error) {
            console.error("Error fetching user posts:", error);
            alert("Failed to load user posts.");
        }
    };
    

    // Helper function to get initials and randomize color
    const getInitialsAndColor = (name) => {
        const generateColor = (input) => {
            let hash = 0;
            for (let i = 0; i < input.length; i++) {
                hash = input.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % avatarColors.length;
            return avatarColors[index];
        };

        const getInitials = () => {
            if (!name) return '?';
            const names = name.split(' ');
            return names.map(n => n[0].toUpperCase()).slice(0, 2).join('');
        };

        return {
            initials: getInitials(),
            color: generateColor(name)
        };
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
            {/* Show the post modal if open */}
            <PostPostModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                navigate={navigate}
            />
            {/* Navigation Bar */}
            <div style={styles.navBar}>
                <div style={styles.navLeft}>
                    <img src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg" alt="Logo" style={styles.navLogo} className='bouncing-logo' />
                    <span style={styles.navText}>Slice of Life</span>
                </div>
                <div style={styles.navRight}>
                  <button onClick={() => setModalOpen(true)} style={styles.backButton}>
                    Make Post!
                  </button>
                  <button onClick={() => navigate("/posts")} style={styles.backButton}>
                    Your Feed
                    </button>
                <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
                    Home   
                  </button>  
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
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>About Me:</strong> {user.bio || 'No bio available'}</p>
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

export default Profile;