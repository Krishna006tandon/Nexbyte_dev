import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ClientPanel from './pages/ClientPanel';
import TaskDetailPage from './pages/TaskDetailPage';
import Member from './pages/Member';
import InternPanel from './pages/InternPanel';
import SrsGenerator from './pages/SrsGenerator';
import Internship from './pages/Internship';

import { SrsProvider } from './context/SrsContext';
import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <SrsProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin/*" element={<Admin />} />
                  <Route path="/client-panel" element={<ClientPanel />} />
                  <Route path="/intern-panel" element={<InternPanel />} />
                  <Route path="/admin/task/:taskId" element={<TaskDetailPage />} />
                  <Route path="/srs-generator" element={<SrsGenerator />} />
                  <Route path="/member" element={<Member />} />
                  <Route path="/internship" element={<Internship />} />
                </Routes>
              </SrsProvider>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

