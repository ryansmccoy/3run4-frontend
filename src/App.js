import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLoginAndCard from "./pages/UserLoginAndCard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<UserLoginAndCard />} />
      </Routes>
    </Router>
  );
}

export default App;
