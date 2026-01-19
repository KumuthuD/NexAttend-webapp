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
    <div className="relative min-h-screen flex flex-col overflow-hidden">
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

        {/* Dark Overlay with gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900 z-10"></div>

        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-96 h-96 -top-20 -left-20 animate-float-slow"></div>
          <div className="orb orb-pink w-80 h-80 top-1/4 -right-20 animate-float"></div>
          <div className="orb orb-blue w-64 h-64 bottom-20 left-1/4 animate-float-reverse"></div>
          <div className="orb orb-purple w-48 h-48 bottom-40 right-1/3 animate-float-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Animated Grid Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        ></div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          {/* Decorative badge */}
          <div className="animate-fade-in-down stagger-1 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
              AI-Powered Attendance System
            </span>
          </div>

          <h1
            className="animate-fade-in-up stagger-2 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 drop-shadow-lg"
          >
            NexAttend: Effortless Attendance.
          </h1>
          <h2
            className="animate-fade-in-up stagger-3 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-white/90 drop-shadow-md"
          >
            Intelligent Insights. <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Smarter Classrooms.</span>
          </h2>
          <p
            className="animate-fade-in-up stagger-4 max-w-2xl text-lg md:text-xl text-gray-300 mb-10 drop-shadow leading-relaxed"
          >
            Automate attendance with AI Multi-Face Detection and transform the
            teaching experience with real-time analytics and insights.
          </p>
          <div
            className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-4 md:gap-6"
          >
            <Link
              to="/features"
              className="btn-glow bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30 text-lg"
            >
              Explore Features
            </Link>
            <Link
              to="/contact"
              className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 hover:border-violet-400/50 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in stagger-6">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-sm">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-gray-400/50 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-violet-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gray-900 py-24 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-purple w-64 h-64 -top-32 left-1/4 opacity-30"></div>
          <div className="orb orb-pink w-48 h-48 bottom-0 right-1/4 opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">NexAttend?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Experience the future of classroom management with our cutting-edge features.
            </p>
            {/* Animated underline */}
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {homeFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

