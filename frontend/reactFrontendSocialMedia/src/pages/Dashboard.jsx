import { useEffect, useState } from "react";
import api from "../api";

const Dashboard = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api
      .get("/books/")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  return (
    <div>
      console.log("Dashboard Component Rendered");
      <h2>Dashboard</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
