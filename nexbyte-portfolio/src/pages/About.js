import React from 'react';
import { Helmet } from 'react-helmet-async';
import Card from '../components/Card';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './About.css';
// import HomeSidebar from '../components/HomeSidebar';
import '../components/HomeSidebar.css';
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
    name: 'Abhishek Mutthalkar',
    role: 'Data Analyst and Python Developer ',
    imageUrl: 'https://picsum.photos/seed/security/400/400',
    bio: 'Skilled in Python, OOPs, and Web Development, with a good understanding of DSA.Capable of creating clean, reliable solutions and visualizing data using Power BI.Curious learner with a focus on improving every day and building meaningful digital tools.',
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
    <>
      <Helmet>
        <title>About Web Development Company | NexByte Studio</title>
        <meta name="description" content="Learn about NexByte Studio - a leading web development company providing innovative digital solutions, custom web applications, and expert development services." />
        <meta name="keywords" content="web development company, web development team, software development company, web developers, nexbyte, nexbyte core" />
        <link rel="canonical" href="https://nexbyte-dev.vercel.app/about" />
      </Helmet>
      
      <div className="about-page">
        <header className="page-header">
          <h1 className="page-title">About Nexbyte_Core - Web Development Company</h1>
          <p className="page-subtitle">
            Welcome to Nexbyte_Core, a hub of innovation where technology meets creativity. We are a collective of passionate developers, designers, and strategists dedicated to building cutting-edge digital solutions. 
            Our mission is to transform complex challenges into elegant, high-performance web applications, AI-driven systems, and secure backend architectures. 
            With a collaborative spirit and a commitment to excellence, we strive to deliver products that are not only functional and scalable but also provide an inspiring user experience. 
            At Nexbyte_Core, we don't just write code; we build the future, one line at a time.
          </p>
        </header>

        <section className="company-story">
          <h2>Our Story as a Web Development Company</h2>
          <p>Nexbyte_Core was founded with a simple vision: to become a web development company that bridges the gap between innovative ideas and practical implementation. As a growing web development company, we understand the challenges businesses face in today's digital landscape. Our team combines technical expertise with creative problem-solving to deliver solutions that drive real business value.</p>
          
          <h3>Web Development Company Philosophy</h3>
          <p>As a client-focused web development company, we believe in transparency, collaboration, and continuous learning. Our approach to web development is rooted in understanding your business objectives and translating them into technical solutions. Every project we undertake as a web development company is an opportunity to push boundaries and set new standards in digital innovation.</p>
          
          <h3>Why Choose Our Web Development Company?</h3>
          <p>Choosing the right web development company is crucial for your project's success. At Nexbyte_Core, we differentiate ourselves through our commitment to quality, innovation, and client satisfaction. Our web development company offers comprehensive services that cover the entire development lifecycle - from initial consultation and strategy to deployment and ongoing support.</p>
          
          <h3>Web Development Company Expertise</h3>
          <p>Our web development company specializes in modern technologies and frameworks. We stay ahead of industry trends to ensure our clients receive cutting-edge solutions. As a versatile web development company, we work across various domains including e-commerce, healthcare, education, and enterprise applications. Our team's diverse skill set allows us to tackle complex challenges and deliver robust, scalable solutions.</p>
        </section>

        <section className="team-section">
          <h2 className="section-title">Our Web Development Team</h2>
          <p>Our web development company is built on the foundation of talented professionals who are passionate about their craft. Each member of our web development team brings unique skills and perspectives, enabling us to deliver comprehensive solutions. From frontend specialists to backend experts, our web development team has the expertise to handle projects of any complexity.</p>
          
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
          <h2 className="section-title">Our Web Development Technology Stack</h2>
          <p>As a modern web development company, we leverage cutting-edge technologies to build robust and scalable applications. Our technology stack is carefully selected based on project requirements, performance needs, and long-term maintainability. This comprehensive approach ensures that our web development company delivers solutions that are both current and future-proof.</p>
          
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

        <section className="company-values">
          <h2>Web Development Company Values</h2>
          <p>At Nexbyte_Core, our values guide everything we do as a web development company. We believe in innovation, integrity, and excellence. These core values shape our approach to web development and define our relationships with clients and team members. As a responsible web development company, we prioritize security, performance, and user experience in every project we undertake.</p>
          
          <h3>Future Vision for Our Web Development Company</h3>
          <p>Looking ahead, our web development company aims to expand our services and impact more businesses through digital transformation. We continue to invest in learning and adopting new technologies to stay at the forefront of web development. Our vision is to be recognized as a leading web development company that consistently delivers exceptional results and drives digital innovation.</p>
        </section>
      </div>
    </>
  );
};

export default About;
