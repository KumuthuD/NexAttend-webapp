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
</div>

};

export default WebPage;