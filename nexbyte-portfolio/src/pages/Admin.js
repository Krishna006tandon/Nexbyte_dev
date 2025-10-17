import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Admin.css';
import Sidebar from '../components/Sidebar';

const Admin = () => {
  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      try {
        if (location.pathname === '/admin/contacts') {
          const res = await fetch('/api/contacts', { headers });
          const data = await res.json();
          if (res.ok) {
            setContacts(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/members') {
          const res = await fetch('/api/users', { headers });
          const data = await res.json();
          if (res.ok) {
            setMembers(data);
          } else {
            console.error(data.message);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [location.pathname]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers([...members, data]);
        setEmail('');
        setPassword('');
        // Refetch members to get the latest list
        const fetchRes = await fetch('/api/users', {
          headers: { 'x-auth-token': token },
        });
        const updatedMembers = await fetchRes.json();
        if (fetchRes.ok) {
          setMembers(updatedMembers);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <h1>Admin Dashboard</h1>
          {location.pathname === '/admin/contacts' && (
            <div>
              <h2>Contact Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.mobile}</td>
                      <td>{contact.message}</td>
                      <td>{new Date(contact.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/members' && (
            <div>
              <h2>Manage Members</h2>
              <form onSubmit={handleAddMember}>
                <h3>Add New Member</h3>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Add Member</button>
              </form>

              <h3>All Members</h3>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin' && (
            <p>Welcome to the admin dashboard!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
