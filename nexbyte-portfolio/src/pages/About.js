import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="container mt-5 about-container">
      {/* Krishna Tandon's Profile */}
              <h1>About Us</h1> 
      <div className="text-center mb-5">
        <h1>Krishna Tandon</h1>
        <p className="lead">Full Stack Developer (Backend + Frontend)</p>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h4>👨‍💻 About Me</h4>
          <p>
            Hi, I’m Krishna Tandon — a passionate Information Technology student at Government Polytechnic, Nagpur, driven by curiosity and creativity to build impactful digital solutions.
          </p>
          <p>
            From designing elegant UIs to crafting secure backends, I love bringing ideas to life through code. My journey so far has been a mix of learning, experimenting, and building full-stack projects that connect technology with real-world needs.
          </p>
          <p>
            Whether it’s an e-commerce platform, a wellness web app, or a desktop management system — I believe every project is an opportunity to learn something new, optimize user experience, and make technology feel more human.
          </p>

          <h4 className="mt-4">💡 What Defines Me</h4>
          <ul>
            <li>🚀 Builder Mindset: I enjoy turning ideas into working applications with clean architecture and intuitive UI/UX.</li>
            <li>🧠 Constant Learner: Always exploring new frameworks, APIs, and design principles to stay ahead.</li>
            <li>💬 Collaborative Spirit: I thrive in teamwork — from ideation and design to deployment and optimization.</li>
            <li>🌱 Tech Meets Purpose: I believe technology should not only solve problems but also inspire well-being and positive impact.</li>
          </ul>

          <h4 className="mt-4">🛠 Tech Stack</h4>
          <p>
            <strong>Frontend:</strong> React.js, Tailwind CSS, HTML, CSS, JavaScript, Framer Motion
            <br />
            <strong>Backend:</strong> Node.js, Express.js, Python (Flask)
            <br />
            <strong>Database:</strong> MongoDB, MySQL
            <br />
            <strong>Other Tools:</strong> JWT Authentication, REST APIs, Git/GitHub, WordPress, Render, Vercel
          </p>

          <h4 className="mt-4">🎯 My Vision</h4>
          <p>
            To grow as a Full-Stack Developer who blends design, logic, and empathy into every line of code — building digital products that make life simpler, smarter, and more mindful.
          </p>

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

      {/* Kajal Mantapurwar's Profile */}
      <div className="text-center mb-5">
        <h2 className="collaborator-name">Kajal Mantapurwar</h2>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h4>👩‍💻 About Me</h4>
          <p>
            Hey there! I’m Kajal Mantapurwar, currently pursuing a Diploma in Artificial Intelligence & Machine Learning from Government Polytechnic, Nagpur.
          </p>
          <p>
            I’m passionate about programming, AI, and technology — always eager to learn, build, and explore innovative ideas that make a real impact. I enjoy solving problems through code and experimenting with new tools to enhance my technical skills.
          </p>

          <h4 className="mt-4">💡 What I Do</h4>
          <ul>
            <li>Learning and exploring AI & ML concepts</li>
            <li>Practicing Python and C++ programming</li>
            <li>Understanding the blend of technology and textile innovation</li>
            <li>Working on small projects to improve my development skills</li>
          </ul>

          <h4 className="mt-4">⚙️ Tech Stack</h4>
          <p>Python • C++ • Machine Learning • Web Development Basics</p>

          <h4 className="mt-4">🎯 My Vision</h4>
          <p>To become a skilled AI developer who uses technology to create smarter and more efficient solutions for everyday challenges.</p>
          <div className="mt-5 text-center">
            <h4>Connect with Me</h4>
            <p>Email: <a href="mailto:k.mantapurwar7133@gmail.com">k.mantapurwar7133@gmail.com</a></p>
            <div className="social-links">
              <a href="https://github.com/KajalMantapurwar" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/kajal-mantapurwar-748844298/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary m-2">
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
          <h4>About Me</h4>
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