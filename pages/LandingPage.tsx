import React from 'react';
import { Link } from 'react-router-dom';
import backgroundVideo from '../assets/background.mp4';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <section className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={backgroundVideo}
          autoPlay
          loop
          muted
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black bg-opacity-50">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our App</h1>
          <p className="text-xl mb-8">Your journey starts here.</p>
          <div>
            <Link
              to="/register"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
