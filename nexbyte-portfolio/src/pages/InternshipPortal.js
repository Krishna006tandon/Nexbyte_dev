import React, { useState, useEffect } from 'react';
import InternshipListingCard from '../components/InternshipListingCard';
import ApplicationForm from '../components/ApplicationForm';
import StudentDashboard from '../components/StudentDashboard';
import CertificateGenerator from '../components/CertificateGenerator';
import { toast } from 'react-toastify';

const InternshipPortal = () => {
  const [user, setUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('listings'); // 'listings', 'dashboard', 'admin'
  const [filters, setFilters] = useState({
    category: 'all',
    mode: 'all',
    search: ''
  });

  useEffect(() => {
    fetchInternships();
    checkUserAuth();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internships/listings');
      const data = await response.json();
      setInternships(data);
    } catch (error) {
      toast.error('Failed to fetch internships');
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleApply = (internship) => {
    if (!user) {
      toast.info('Please login to apply for internships');
      // Redirect to login or show login modal
      return;
    }
    setSelectedInternship(internship);
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = async (formData) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      await fetchInternships(); // Refresh listings
      setShowApplicationForm(false);
      setSelectedInternship(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredInternships = internships.filter(internship => {
    if (filters.category !== 'all' && internship.category !== filters.category) {
      return false;
    }
    if (filters.mode !== 'all' && internship.mode !== filters.mode) {
      return false;
    }
    if (filters.search && !internship.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !internship.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading internship opportunities...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and wants to see dashboard
  if (user && activeView === 'dashboard') {
    return <StudentDashboard user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">NEX</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">NexByte Internship Portal</h1>
                <p className="text-blue-100">Kickstart your career with amazing opportunities</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setActiveView('listings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'listings' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Internships
              </button>
              {user && (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'dashboard' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Dashboard
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'admin' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Admin Panel
                </button>
              )}
              {!user ? (
                <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Login
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-sm">Welcome, {user.name}</span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setUser(null);
                      setActiveView('listings');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeView === 'listings' && (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Dream Internship
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join NexByte and gain hands-on experience with cutting-edge technologies. 
                Work on real projects and build your portfolio.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-2 flex items-center">
                  <input
                    type="text"
                    placeholder="Search internships..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="flex-1 px-4 py-2 outline-none"
                  />
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">Mobile Development</option>
                    <option value="data-science">Data Science</option>
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="digital-marketing">Digital Marketing</option>
                    <option value="content-writing">Content Writing</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Mode:</label>
                  <select
                    value={filters.mode}
                    onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Modes</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredInternships.length} of {internships.length} internships
                </div>
              </div>
            </div>
          </section>

          {/* Internship Listings */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredInternships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredInternships.map((internship) => (
                    <InternshipListingCard
                      key={internship._id}
                      internship={internship}
                      onApply={handleApply}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </section>

          {/* Trust Section */}
          <section className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Choose NexByte?</h2>
                <p className="text-gray-300 text-lg">Join thousands of students who have launched their careers with us</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Real Projects</h3>
                  <p className="text-gray-300">Work on actual client projects and build your portfolio</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert Mentorship</h3>
                  <p className="text-gray-300">Learn from industry experts with years of experience</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Certified Completion</h3>
                  <p className="text-gray-300">Receive verified certificates upon successful completion</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">Got questions? We've got answers</p>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    question: "How long are the internship programs?",
                    answer: "Our internship programs typically range from 3 to 6 months, depending on the role and your availability."
                  },
                  {
                    question: "Are the internships paid?",
                    answer: "We offer both paid and unpaid internships. Paid positions are clearly marked in the job description."
                  },
                  {
                    question: "What are the eligibility criteria?",
                    answer: "You should be currently enrolled in or recently graduated from a relevant degree program. Specific requirements vary by position."
                  },
                  {
                    question: "Can I work remotely?",
                    answer: "Yes! We offer remote, on-site, and hybrid internship opportunities. Check the job description for details."
                  },
                  {
                    question: "How do I apply for an internship?",
                    answer: "Simply browse our available positions, click 'Apply Now', and fill out the application form with your details and resume."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedInternship && (
        <ApplicationForm
          internship={selectedInternship}
          onClose={() => {
            setShowApplicationForm(false);
            setSelectedInternship(null);
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default InternshipPortal;
