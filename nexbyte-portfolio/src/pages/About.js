
import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="container mt-5 about-container">
      {/* Krishna Tandon's Profile */}
      <div className="text-center mb-5">
        <h1>Krishna Tandon</h1>
        <p className="lead">Full Stack Developer (Backend + Frontend)</p>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h4>About Me</h4>
          <p>
            I’m a passionate developer who loves building modern and scalable web applications. I specialize in backend development using Flask and MongoDB, but I also enjoy creating responsive and user-friendly interfaces.
          </p>

          <h4 className="mt-4">Expertise</h4>
          <p>Python, Flask, MongoDB, REST API, Tailwind CSS, JavaScript</p>

          <h4 className="mt-4">Interests</h4>
          <p>Web Development, Cloud Deployment, Performance Optimization, AI Integration</p>

          <div className="mt-5 text-center">
            <h4>Connect with Me</h4>
            <p>Email: <a href="mailto:krishna.a.tandon@gmail.com">krishna.a.tandon@gmail.com</a></p>
            <div className="social-links">
              <a href="https://github.com/Krishna006tandon" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/krishna-tandon-9879a7367" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Rudresh Vyas's Profile */}
      <div className="text-center mb-5">
        <h2 className="collaborator-name">Rudresh Vyas</h2>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h4>About Rudresh</h4>
          <p>
            Currently pursuing Information Technology. Passionate about Web Development, AI, and C++. Exploring Flutter, Git, and Open-Source Contributions. I love playing Badminton and chilling with some TV shows & tech podcasts.
          </p>

          <h4 className="mt-4">Tech Stack</h4>
          <p>C++, Python, HTML, CSS, JavaScript, Flutter, Git, Flask</p>

          <h4 className="mt-4">Interests</h4>
          <p>Web Apps, AI Projects, and Mobile Development</p>

          <div className="mt-5 text-center">
            <h4>Connect with Rudresh</h4>
            <p>Email: <a href="mailto:vyasrudresh985@gmail.com">vyasrudresh985@gmail.com</a></p>
            <div className="social-links">
              <a href="https://github.com/Rudreshvyas07" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/rudresh-vyas-9b85582b0/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
