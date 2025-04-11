import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Login from "./pages/Login"; 
import PostItem from "./pages/PostItem";
import PostGenre from "./pages/PostGenre";
import Genre from "./pages/Genre";
import SignUp from "./pages/Signup";
import Preferences from "./pages/Preferences";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<SignUp />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/login" element={<Login />} /> {/* Redirect to Login first */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
            <Route path="/post-item" element={<PostItem />} /> {/* Add Post Item route */}
            <Route path="/post-genre" element={<PostGenre />} /> {/* Post Genre route */}
            <Route path="/view-genre" element={<Genre />} /> {/* View Genre route */}
        </Routes>
    </Router>
  );
}

export default App;

