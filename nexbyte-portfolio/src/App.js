import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ClientPanel from './pages/ClientPanel';
import { SrsProvider } from './context/SrsContext';


import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Navbar isAdmin={isAdmin} isClient={isClient} setIsAdmin={setIsAdmin} setIsClient={setIsClient} />
        <main className="main-content">
          <SrsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login setIsAdmin={setIsAdmin} setIsClient={setIsClient} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/client-panel" element={<ClientPanel />} />
            </Routes>
          </SrsProvider>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
