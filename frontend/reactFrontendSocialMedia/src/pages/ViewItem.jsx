"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PostPostModal from "./PostPost";

const hashStringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert the hash to a color by using the hash value to generate RGB
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    
    // Return the color in hex format
    return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

function ItemDetails() {
    const [genreName, setGenreName] = useState("");
    const [item, setItem] = useState(null);
    const navigate = useNavigate();
    const [titleColor, setTitleColor] = useState(null); // State to store the title color
    const { precordsid } = useParams(); // Use precordsid from the URL params
    const API_URL = "http://localhost:8001";
    const token = localStorage.getItem("accessToken");
    const [isModalOpen, setModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    

    const styles = {
        pageContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflowY: 'auto',
            padding: '0', // No padding for the page container to avoid gaps
            boxSizing: 'border-box',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
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
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
        },
        title: {
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: '550',
            color: '#1c1e21',
            marginTop: '20px',
            marginBottom: '20px',
            paddingBottom: '10px'
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
        itemInfo: {
            marginBottom: '20px',
        },
        postCard: {
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'white',
            border: '1px solid #dddfe2',
            borderRadius: '12px',
            boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
            padding: '30px',
            marginTop: '40px',
            alignItems: 'flex-start',
            flexWrap: 'wrap', // Makes layout adaptive
            gap: '20px',
          },
        itemImage: {
            flex: '1 1 40%',
            maxWidth: '500px',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '12px',
          },
          
          postCardContent: {
            flex: '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minWidth: '250px',
          },
        itemTitle: {
            fontSize: '32px',
            fontWeight: '600',
            color: '#3c413a',
            marginBottom: '10px',
            wordBreak: 'break-word',
          },
        // postCard: {
        //     display: 'flex',
        //     flexDirection: 'row', // Align image and content side by side
        //     backgroundColor: 'white',
        //     border: '1px solid #dddfe2',
        //     borderRadius: '12px',
        //     boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
        //     overflow: 'hidden',
        //     padding: '20px',
        //     marginTop: '40px',
        //     alignItems: 'center', // Align image and text vertically centered
        // },
        // itemImage: {
        //     width: '45%', // Increase the width of the image to 45% of the post card width
        //     height: 'auto', // Maintain aspect ratio
        //     maxHeight: '400px', // You can adjust this based on the size you want
        //     objectFit: 'contain', // Make sure the image is properly cropped and contained
        //     borderRadius: '8px',
        //     marginRight: '20px', // Add space between image and text
        // },
        // postCardContent: {
        //     flex: 1, // Content takes up the remaining space
        //     display: 'flex',
        //     flexDirection: 'column', // Stack the content vertically
        // },
        // itemDescription: {
        //     fontSize: '16px',
        //     color: '#1c1e21',
        //     //fontFamily: '"Georgia", serif', // Professional serif font for description
        //     marginTop: '15px',
        // },
        // itemTitle: {
        //     fontSize: '28px', // Larger font size for the item title
        //     fontWeight: '570',
        //     color: '#3c413a',
        //     //fontFamily: '"Georgia", serif',
        //     marginBottom: '2px',
        //     marginTop: '-130px',
        // },
        metaInfo: {
            fontSize: '14px',
            color: '#65676b',
            marginTop: '3px',
            //fontFamily: '"Georgia", serif',
            marginBottom: '3px',
        },
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchItemDetails();
        }
    }, [token, navigate, precordsid]);

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/items/${precordsid}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItem(response.data);

        // Fetch the genre name based on item.genre
        const genreResponse = await axios.get(`${API_URL}/api/genres/${response.data.genre}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setGenreName(genreResponse.data.name);  // Assuming the response contains a 'name' field

        } catch (error) {
            console.error("Error fetching all item details:", error);
            alert("Failed to load some item details.");
        }
    };

    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        navigate("/home");
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
                
                {item ? (
                    <div style={styles.itemInfo}>
                        <div style={styles.postCard}>
                            {item.presigned_image_url && (
                                <img
                                    src={item.presigned_image_url}
                                    alt={item.title}
                                    style={styles.itemImage}
                                />
                            )}
                            <div style={styles.postCardContent}>
                                <h3 style={styles.itemTitle}>{item.title}</h3>
                                <p style={styles.itemDescription}><strong>Description:</strong> {item.description}</p>
                                <p style={styles.metaInfo}>
                                    <strong>Published Date:</strong> {new Date(item.publish_date).toLocaleDateString()}
                                </p>
                                <p style={styles.metaInfo}>
                                    <strong>Genre:</strong> {genreName || "Loading..."}</p>
                                <p style={styles.metaInfo}>
                                    <strong>Type:</strong> {item.type === 1 ? "Book" : "Unknown Type"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading item details...</p>
                )}
            </div>
        </div>
    );
}

export default ItemDetails;


// "use client"

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import PostPostModal from "./PostPost";

// const hashStringToColor = (str) => {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//         hash = (hash << 5) - hash + str.charCodeAt(i);
//         hash = hash & hash; // Convert to 32bit integer
//     }

//     // Convert the hash to a color by using the hash value to generate RGB
//     const r = (hash & 0xFF0000) >> 16;
//     const g = (hash & 0x00FF00) >> 8;
//     const b = hash & 0x0000FF;
    
//     // Return the color in hex format
//     return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
// };

// function ItemDetails() {
//     const [genreName, setGenreName] = useState("");
//     const [item, setItem] = useState(null);
//     const navigate = useNavigate();
//     const [titleColor, setTitleColor] = useState(null); // State to store the title color
//     const { precordsid } = useParams(); // Use precordsid from the URL params
//     const API_URL = "http://localhost:8001";
//     const token = localStorage.getItem("accessToken");
//     const [isModalOpen, setModalOpen] = useState(false);
    

//     const styles = {
//         pageContainer: {
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100vw',
//             height: '100vh',
//             backgroundColor: '#f0f2f5',
//             fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
//             overflowY: 'auto',
//             padding: '0', // No padding for the page container to avoid gaps
//             boxSizing: 'border-box',
//         },
//         container: {
//             maxWidth: '1200px',
//             margin: '0 auto',
//         },
//         header: {
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginBottom: '30px',
//         },
//         title: {
//             textAlign: 'center',
//             fontSize: '24px',
//             fontWeight: '550',
//             color: '#1c1e21',
//             marginTop: '20px',
//             marginBottom: '20px',
//             paddingBottom: '10px'
//         },
//         navBar: {
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: '10px 20px',
//             backgroundColor: '#c4ede7',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             width: '100%',
//             boxSizing: 'border-box',
//             position: 'sticky',
//             top: 0,
//             zIndex: 100,
//         },
//         navLeft: {
//             display: 'flex',
//             alignItems: 'center',
//             gap: '15px',
//         },
//         navLogo: {
//             width: '40px',
//             height: '40px',
//             borderRadius: '8px',
//             objectFit: 'contain',
//             transition: "transform 0.5s ease-in-out",
//             animation: "bounce 0.75s infinite",
//         },
//         navText: {
//             fontSize: '18px',
//             fontWeight: '600',
//             color: '#1c1e21',
//         },
//         backButton: {
//             width: '120px',
//             padding: '10px 0px',
//             backgroundColor: '#3c413a',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             fontWeight: '600',
//             textAlign: 'center',
//             whiteSpace: 'nonwrap',
//         },
//         navRight: {
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px'
//         },

//         itemInfo: {
//             marginBottom: '20px',
//         },
//         // postCard: {
//         //     display: 'flex',
//         //     flexDirection: 'row', // Align image and content side by side
//         //     backgroundColor: 'white',
//         //     border: '1px solid #dddfe2',
//         //     borderRadius: '12px',
//         //     boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
//         //     overflow: 'hidden',
//         //     padding: '20px',
//         //     marginTop: '40px',
//         //     alignItems: 'center', // Align image and text vertically centered
//         // },
//         // itemImage: {
//         //     width: '45%', // Increase the width of the image to 45% of the post card width
//         //     height: 'auto', // Maintain aspect ratio
//         //     maxHeight: '400px', // You can adjust this based on the size you want
//         //     objectFit: 'contain', // Make sure the image is properly cropped and contained
//         //     borderRadius: '8px',
//         //     marginRight: '20px', // Add space between image and text
//         // },
//         // postCardContent: {
//         //     flex: 1, // Content takes up the remaining space
//         //     display: 'flex',
//         //     flexDirection: 'column', // Stack the content vertically
//         // },
//         // itemDescription: {
//         //     fontSize: '16px',
//         //     color: '#1c1e21',
//         //     //fontFamily: '"Georgia", serif', // Professional serif font for description
//         //     marginTop: '15px',
//         // },
//         // itemTitle: {
//         //     fontSize: '28px', // Larger font size for the item title
//         //     fontWeight: '570',
//         //     color: '#3c413a',
//         //     //fontFamily: '"Georgia", serif',
//         //     marginBottom: '2px',
//         //     marginTop: '-130px',
//         // },
//         postCard: {
//             display: 'flex',
//             flexDirection: 'row',
//             backgroundColor: 'white',
//             border: '1px solid #dddfe2',
//             borderRadius: '12px',
//             boxShadow: '0 6px 8px rgba(0,0,0,0.1)',
//             padding: '30px',
//             marginTop: '40px',
//             alignItems: 'flex-start',
//             flexWrap: 'wrap', // Makes layout adaptive
//             gap: '20px',
//           },
//         itemImage: {
//             flex: '1 1 40%',
//             maxWidth: '500px',
//             height: 'auto',
//             objectFit: 'contain',
//             borderRadius: '12px',
//           },
          
//           postCardContent: {
//             flex: '1 1 50%',
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'flex-start',
//             minWidth: '250px',
//           },
//         itemTitle: {
//             fontSize: '32px',
//             fontWeight: '600',
//             color: '#3c413a',
//             marginBottom: '10px',
//             wordBreak: 'break-word',
//           },
          
//           itemDescription: {
//             fontSize: '17px',
//             color: '#1c1e21',
//             marginTop: '10px',
//             lineHeight: '1.5',
//             whiteSpace: 'pre-wrap',
//           },
//         metaInfo: {
//             fontSize: '14px',
//             color: '#65676b',
//             marginTop: '3px',
//             //fontFamily: '"Georgia", serif',
//             marginBottom: '3px',
//         },
//     };

//     useEffect(() => {
//         if (!token) {
//             navigate("/");
//         } else {
//             fetchItemDetails();
//         }
//     }, [token, navigate, precordsid]);

//     const fetchItemDetails = async () => {
//         try {
//             const response = await axios.get(`${API_URL}/api/items/${precordsid}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setItem(response.data);

//         // Fetch the genre name based on item.genre
//         const genreResponse = await axios.get(`${API_URL}/api/genres/${response.data.genre}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         setGenreName(genreResponse.data.name);  // Assuming the response contains a 'name' field

//         } catch (error) {
//             console.error("Error fetching all item details:", error);
//             alert("Failed to load some item details.");
//         }
//     };

//     return (
//         <div style={styles.pageContainer}>
//             {/* Add this style tag if you don't want to create a separate CSS file */}
//             <style>
//                 {`
//                 @keyframes bounce {
//                     0%, 100% { transform: translateY(0); }
//                     50% { transform: translateY(-3px); }
//                 }
//                 .bouncing-logo {
//                     animation: bounce 0.75s infinite;
//                 }
//                 `}
//             </style>
//             {/* Show the post modal if open */}
//             <PostPostModal 
//                 isOpen={isModalOpen}
//                 onClose={() => setModalOpen(false)}
//                 navigate={navigate}
//             />
//             {/* Navigation Bar */}
//             <div style={styles.navBar}>
//                 <div style={styles.navLeft}>
//                     <img src="https://i.pinimg.com/736x/12/1e/3c/121e3c7353b6c0c7ed5b8913918bc8bc.jpg" alt="Logo" style={styles.navLogo} className='bouncing-logo' />
//                     <span style={styles.navText}>Slice of Life</span>
//                 </div>
//                 <div style={styles.navRight}>
//                   <button onClick={() => setModalOpen(true)} style={styles.backButton}>
//                     Make Post!
//                   </button>
//                   <button onClick={() => navigate("/posts")} style={styles.backButton}>
//                     Your Feed
//                     </button>
//                 <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
//                     Home   
//                   </button>  
//                 </div>
//             </div>
            
//             <div style={styles.container}>
                
//                 {item ? (
//                     <div style={styles.itemInfo}>
//                         <div style={styles.postCard}>
//                             {item.presigned_image_url && (
//                                 <img
//                                     src={item.presigned_image_url}
//                                     alt={item.title}
//                                     style={styles.itemImage}
//                                 />
//                             )}
//                             <div style={styles.postCardContent}>
//                                 <h3 style={styles.itemTitle}>{item.title}</h3>
//                                 <p style={styles.itemDescription}><strong>Description:</strong> {item.description}</p>
//                                 <p style={styles.metaInfo}>
//                                     <strong>Published Date:</strong> {new Date(item.publish_date).toLocaleDateString()}
//                                 </p>
//                                 <p style={styles.metaInfo}>
//                                     <strong>Genre:</strong> {genreName || "Loading..."}</p>
//                                 <p style={styles.metaInfo}>
//                                     <strong>Type:</strong> {item.type === 1 ? "Book" : "Unknown Type"}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <p>Loading item details...</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ItemDetails;
