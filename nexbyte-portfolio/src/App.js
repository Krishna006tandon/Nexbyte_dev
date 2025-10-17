import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './App.css';

const PrivateRoute = ({ isAdmin, children }) => {
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
            <Route
              path="/admin"
              element={<PrivateRoute isAdmin={isAdmin}><Admin /></PrivateRoute>}
            />
            <Route
              path="/admin/contacts"
              element={<PrivateRoute isAdmin={isAdmin}><Admin /></PrivateRoute>}
            />
            <Route
              path="/admin/members"
              element={<PrivateRoute isAdmin={isAdmin}><Admin /></PrivateRoute>}
            />
            <Route
              path="/admin/clients"
              element={<PrivateRoute isAdmin={isAdmin}><Admin /></PrivateRoute>}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;