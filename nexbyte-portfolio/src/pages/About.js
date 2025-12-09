import React from 'react';
import Card from '../components/Card';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './About.css';
import HomeSidebar from '../components/HomeSidebar'; // Import the sidebar

const teamMembers = [
  {
    name: 'Krishna Tandon',
    role: 'Full Stack Developer',
    imageUrl: 'https://picsum.photos/seed/fullstack/400/400',
    bio: 'MERN stack specialist, passionate about building scalable and efficient web applications. Loves to turn complex problems into simple and elegant solutions.',
    github: 'https://github.com/Krishna006tandon',
    linkedin: 'https://www.linkedin.com/in/krishna-tandon-9879a7367',
  },
  {
    name: 'Kajal Mantapurwar',
    role: 'AI & ML Enthusiast',
    imageUrl: 'https://picsum.photos/seed/ml/400/400',
    bio: 'Aspiring AI & ML engineer. Skilled in Python and data analysis. Eager to learn and apply cutting-edge technologies to solve real-world problems.',
    github: 'https://github.com/KajalMantapurwar',
    linkedin: 'https://www.linkedin.com/in/kajal-mantapurwar-748844298/',
  },
  {
    name: 'Abhishek Muthalkar',
    role: 'Frontend & Security',
    imageUrl: 'https://picsum.photos/seed/security/400/400',
    bio: 'Security-focused frontend developer. Expertise in system recovery, backend architecture, and automation scripts with Python and C++.',
    github: 'https://github.com/ABHISHEK120906',
    linkedin: 'https://www.linkedin.com/in/abhishek-mutthalkar-93726b377?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app ',
  },
  {
    name: 'Om Bhudake',
    role: 'Web & AI Developer',
    imageUrl: 'https://picsum.photos/seed/ai/400/400',
    bio: 'I am a Software Engineer and Web Developer with strong expertise in Python and a growing passion for Artificial Intelligence. I enjoy building efficient applications, exploring new technologies, and continuously improving my skills.',
    github: 'https://github.com/ombhudake28',
    linkedin: 'https://www.linkedin.com/in/om-bhudake-8584b331b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
  },
];

const About = () => {
  return (
    <div className="about-page">
      <header className="page-header">
        <h1 className="page-title">About NexByte_Dev</h1>
        <p className="page-subtitle">
          Welcome to NexByte_Dev, a hub of innovation where technology meets creativity. We are a collective of passionate developers, designers, and strategists dedicated to building cutting-edge digital solutions. 
          Our mission is to transform complex challenges into elegant, high-performance web applications, AI-driven systems, and secure backend architectures. 
          With a collaborative spirit and a commitment to excellence, we strive to deliver products that are not only functional and scalable but also provide an inspiring user experience. 
          At NexByte_Dev, we don't just write code; we build the future, one line at a time.
        </p>
      </header>

      <section className="team-section">
        <h2 className="section-title">Our Team</h2>
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

      <section className="tech-stack-section">
        <h2 className="section-title">Our Core Technologies</h2>
        <div className="tech-stack-grid">
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" /><span>React</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" /><span>Node.js</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" /><span>JavaScript</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" /><span>Python</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" /><span>MongoDB</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" alt="Flutter" /><span>Flutter</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" /><span>Git</span></div>
        </div>
      </section>


    </div>
  );
};

export default About;
