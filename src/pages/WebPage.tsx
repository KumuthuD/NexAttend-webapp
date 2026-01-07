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

<div className="relative z-20 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center items-start text-left">

    <h1
  className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500 drop-shadow-lg animate-fade-in-up"
  style={{ animationDelay: '0.1s' }}
>
  NextAttend
</h1>

<h2
  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 text-indigo-300 drop-shadow-md animate-fade-in-up"
  style={{ animationDelay: '0.3s' }}
>
  Intelligent Insights - Smarter Classrooms.
</h2>

<p
  className="max-w-2xl text-xl text-gray-200 mb-10 drop-shadow animate-fade-in-up leading-relaxed"
  style={{ animationDelay: '0.5s' }}
>
  Automate attendance with AI Multi-Face Detection and transform the teaching experience.
</p>

<div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
</div>

</div>

</div>

};

export default WebPage;