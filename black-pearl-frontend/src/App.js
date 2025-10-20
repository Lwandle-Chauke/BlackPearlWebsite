import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route "/" to About page */}
        <Route path="/" element={<About />} />

        {/* Optional: add more routes later */}
        {/* <Route path="/gallery" element={<Gallery />} /> */}
        {/* <Route path="/dashboard" element={<TravelDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
