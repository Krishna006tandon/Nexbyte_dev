import React from 'react';
import Card from '../components/Card';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './About.css';

const teamMembers = [
  {
    name: 'Krishna Tandon',
    role: 'Full Stack Developer',
    imageUrl: 'https://via.placeholder.com/150',
    bio: 'Passionate Information Technology student driven by curiosity and creativity to build impactful digital solutions.',
    github: 'https://github.com/Krishna006tandon',
    linkedin: 'https://www.linkedin.com/in/krishna-tandon-9879a7367',
  },
  {
    name: 'Rudresh Vyas',
    role: 'Web & AI Developer',
    imageUrl: 'https://via.placeholder.com/150',
    bio: 'Exploring Web Development, AI, and C++. Passionate about Flutter, Git, and Open-Source Contributions.',
    github: 'https://github.com/Rudreshvyas07',
    linkedin: 'https://www.linkedin.com/in/rudresh-vyas-9b85582b0/',
  },
  {
    name: 'Kajal Mantapurwar',
    role: 'AI & ML Enthusiast',
    imageUrl: 'https://via.placeholder.com/150',
    bio: 'Pursuing a Diploma in AI & ML. Eager to learn, build, and explore innovative ideas that make a real impact.',
    github: 'https://github.com/KajalMantapurwar',
    linkedin: 'https://www.linkedin.com/in/kajal-mantapurwar-748844298/',
  },
];

const About = () => {
  return (
    <div className="about-page">
      <header className="page-header">
        <h1 className="page-title">About Our Team</h1>
        <p className="page-subtitle">
          We are a team of passionate developers and designers dedicated to creating innovative and beautiful digital experiences. 
          Our diverse skills and collaborative spirit drive us to build technology that is not only functional but also inspiring.
        </p>
      </header>

      <section className="team-section">
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <Card key={index} className="team-member-card">
              <img src={member.imageUrl} alt={member.name} className="profile-image" />
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p>{member.bio}</p>
              <div className="social-links">
                <a href={member.github} target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
