import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/contacts', {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setContacts(data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
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
  );
};

export default Admin;
