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
      </section>
    </div>
  );
};

export default LandingPage;
