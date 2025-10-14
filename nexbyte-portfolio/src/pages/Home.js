import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-white text-center">
        <div className="container">
          <h1 className="display-4">Build Your Digital Future</h1>
          <p className="lead">We create stunning and powerful web and mobile applications.</p>
          <Link to="/contact" className="btn btn-light btn-lg">Get in Touch</Link>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mt-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <div className="row">
          <div className="col-md-4">
            <div className="card text-center mb-4">
              <div className="card-body">
                {/* Icon Placeholder */}
                <div className="icon-placeholder mb-3"></div>
                <h5 className="card-title">Web Development</h5>
                <p className="card-text">We build responsive and scalable web applications using the latest technologies.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center mb-4">
              <div className="card-body">
                {/* Icon Placeholder */}
                <div className="icon-placeholder mb-3"></div>
                <h5 className="card-title">Mobile Development</h5>
                <p className="card-text">We create native and cross-platform mobile apps for Android and iOS.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center mb-4">
              <div className="card-body">
                {/* Icon Placeholder */}
                <div className="icon-placeholder mb-3"></div>
                <h5 className="card-title">UI/UX Design</h5>
                <p className="card-text">We design beautiful and intuitive user interfaces that your users will love.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;