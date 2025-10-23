import React, { useContext, useState, useEffect } from 'react';
import Card from '../components/Card';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './About.css';
import { AuthContext } from '../context/AuthContext';

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
    name: 'Rudresh Vyas',
    role: 'Web & AI Developer',
    imageUrl: 'https://picsum.photos/seed/ai/400/400',
    bio: 'Expert in web development and AI. Proficient in C++, Flutter, and Git. Passionate about open-source and building intelligent systems.',
    github: 'https://github.com/Rudreshvyas07',
    linkedin: 'https://www.linkedin.com/in/rudresh-vyas-9b85582b0/',
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
];

const About = () => {
  const { user } = useContext(AuthContext);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      if (user && user.role === 'admin') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/admin/contributions', {
            headers: {
              'x-auth-token': token,
            },
          });
          const data = await response.json();
          setContributions(data);
        } catch (error) {
          console.error('Error fetching admin contributions:', error);
        }
      }
    };

    fetchContributions();
  }, [user]);

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

      {user && user.role === 'admin' && (
        <section className="admin-contributions">
          <h2 className="section-title">Admin Contributions</h2>
          <pre>{JSON.stringify(contributions, null, 2)}</pre>
        </section>
      )}

      <section className="tech-stack-section">
        <h2 className="section-title">Our Tech Stack</h2>
        <div className="tech-stack-grid">
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" /><span>React</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" /><span>Node.js</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express" /><span>Express</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" /><span>MongoDB</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" /><span>JavaScript</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" /><span>HTML5</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" /><span>CSS3</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" /><span>Git</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" /><span>GitHub</span></div>
          <div className="tech-item"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" alt="Vercel" /><span>Vercel</span></div>
        </div>
      </section>
    </div>
  );
};

export default About;
