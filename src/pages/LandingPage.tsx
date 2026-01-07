import React from "react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import demoVideo from "../assets/videos/nexattend-demo.mp4";
import {
  CheckCircleIcon,
  BrainIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "../components/icons";

const LandingPage = () => {
  const homeFeatures = [
    {
      icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
      title: "Automated Accuracy",
      description: "AI Face Recognition for foolproof, fast attendance.",
    },
    {
      icon: <BrainIcon className="w-8 h-8 text-white" />,
      title: "Data-Driven Decisions",
      description: "Gain deep insights with detailed attendance analytics.",
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
      title: "Secure & Compliant",
      description: "Data is protected with advanced safeguards.",
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      title: "Engaged Students",
      description: "Increase classroom interaction and focus.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Video Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={demoVideo}
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Dark Overlay for Text Readability */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-500 drop-shadow-lg"
          >
            NexAttend: Effortless Attendance.
          </h1>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 text-white drop-shadow-md"
          >
            Intelligent Insights. Smarter Classrooms.
          </h2>
          <p
            className="max-w-2xl text-xl text-gray-200 mb-10 drop-shadow"
          >
            Automate attendance with AI Multi-Face Detection and transform the
            teaching experience.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              to="/features"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-violet-500/50 text-lg"
            >
              Explore Features
            </Link>
            <Link
              to="/webpage"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              Go to the WebPage
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section (Below the fold) */}
      <div className="bg-gray-900 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {homeFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className=""
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
