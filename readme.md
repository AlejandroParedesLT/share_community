## COMPSCI 516 - Database Systems Final Project  
### Milestone 2  

**Team Name:** Slice of Culture  
**Name:** Alejandro Paredes La Torre, Ilseop Lee, Nakiyah Dhariwala, Nruta Choudhari, Rishika Randev

## Project Overview  
This is a social platform that allows users to share and explore content they have recently consumed, such as movies, books, and music. The platform provides a recommendation system based on collaborative filtering and enables users to engage with each other through forum discussions.  

## Business Requirements  
The application functions as follows:  
- Users can view **postcards** displaying the latest content consumed by others.  
- Clicking a postcard redirects to the content owner's **profile**, showcasing their recent activities.  
- A **navigation bar** allows users to access relevant **forums**, where they can engage in discussions via a group chat.  

---

## Features & Goals  

### **Backend**  
- User Authentication & Token Management  
- API Endpoints: Users, Events, Items, Posts, Forums, Following, Messages, Likes  
- WebSockets for real-time messaging  

### **Frontend**  
- **Postcards Page** (Latest user activity)  
- **Profile Page** (User interactions & preferences)  
- **Forums Page** (Community discussions)  

### **Machine Learning & Recommendation System**  
- **Collaborative Filtering Model** using TensorFlow  
- **Vector Database** for optimized user-item retrieval  
- **Bonus:** LLM Augmentation for Forums (optional)  

### **Deployment (CI/CD & Configuration)**  
- Docker-compose setup with PostgreSQL  
- Continuous Integration & Continuous Deployment (CI/CD)  
- Automated testing  

---

## Task Completion  

### **Documentation**  
- Relational database diagrams  
- Initial exploration of ML recommendation model  

### **Setup**  
- **Docker-compose** with PostgreSQL, Django, and React  
- **Backend endpoints** tested in Postman:  
  - User authentication  
  - Movies, Books, Music, Events, and Items APIs  

### **Frontend**  
- **Main React project initialized**  

---

## **Relational Database Architecture**  

- **Events Module**  
- **Posts Module**  
- **Forums Module**  

---

## **Recommendation System Architecture**  

### **TensorFlow Recommenders**  
The recommendation model uses a **two-tower neural network** that maps users and items into a shared latent space. Users with similar preferences are placed closer in this space, allowing for **personalized recommendations**.  

### **Two-Stage Recommendation Process**  
1. **Retrieve Users with Similar Embeddings**  
   - Identify users with close proximity in the latent space.  
   - Reduce thousands of potential matches to a small, highly relevant group.  

2. **Retrieve Common Item Embeddings**  
   - Suggest content that overlaps among users with shared interests.  
   - Example: "You both liked Harry Potter and Beethoven."  

### **LLM-Augmented Forums (Bonus Feature)**  
- A **Large Language Model (LLM)** moderates and personalizes forum interactions.  
- Enhances engagement by dynamically adapting forum content.  

---

## **Setup & Installation**  

### **Prerequisites**  
Ensure you have the following installed:  
- **Docker & Docker Compose**  
- **Python 3.9+**  
- **Node.js & npm**  

### **Run the Project**  
1. **Clone the repository:**  
   ```sh
   git clone https://github.com/AlejandroParedesLT/share_community.git
   cd share_community
