import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/style.css';
import Home from './components/pages/Home';
import Bookings from './components/pages/Bookings';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bookings" element={<Bookings />} />
            </Routes>
        </Router>
    );
}

export default App;
