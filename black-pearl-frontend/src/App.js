import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages
import Home from "./pages/Home";
import About from "./pages/About";
import Quote from "./pages/Quote";
import Contact from "./pages/Contact";
import Fleet from "./pages/Fleet";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<Bookings />} />
        {/* Add a catch-all route for undefined paths */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;