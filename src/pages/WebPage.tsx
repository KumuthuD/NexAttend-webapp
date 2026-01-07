import React from 'react';
import { Link } from 'react-router-dom';
import demoVideo from '../components/signup-page.mp4';

const WebPage = () => {
  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
    </div>
  );

  return (
  <div className="relative h-screen flex flex-col overflow-hidden">
    <div className="relative w-full h-full overflow-hidden">
    </div>
  </div>
);

<div className="relative w-full h-full overflow-hidden">
  <video
    className="absolute top-0 left-0 w-full h-full object-cover"
    src={demoVideo}
    autoPlay
    muted
    loop
    playsInline
  />

<div
  className="absolute inset-0 z-10 pointer-events-none"
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '100px 100px'
  }}
></div>

<div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>


</div>



};

export default WebPage;