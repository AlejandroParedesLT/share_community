import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Login from "./pages/Login"; 
import PostItem from "./pages/PostItem"; // Import the new components
import Posts from "./pages/Posts";
import PostPost from "./pages/PostPost";
import UserProfile from "./pages/Profile";
import ItemDetails from "./pages/ViewItem";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} /> {/* Redirect to Login first */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/items" element={<Items />} />
              <Route path="/post-item" element={<PostItem />} /> {/* Add Post Item route */}
              <Route path="/posts" element={<Posts />} />
              <Route path="/create-post" element={<PostPost />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/view-item/:precordsid" element={<ItemDetails />} />
          </Routes>
      </Router>
  );
}

export default App;


