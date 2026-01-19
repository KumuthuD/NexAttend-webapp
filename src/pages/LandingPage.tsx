import React, { useState } from "react";
import FeatureCard from "../components/FeatureCard";
import demoVideo from "../assets/videos/nexattend-demo.mp4";
import { LinkedInIcon, InstagramIcon, XIcon } from "../components/icons";
import kumuthuImg from "../assets/team/kumuthu.jpg";
import thisanduImg from "../assets/team/thisandu.jpg";
import thiviruImg from "../assets/team/thiviru.jpg";
import yasithaImg from "../assets/team/yasitha.jpg";
import virajImg from "../assets/team/viraj.jpg";
import sudamImg from "../assets/team/sudam.jpg";
import {
  CameraIcon,
  BrainIcon,
  ShieldCheckIcon,
  UsersIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
} from "../components/icons";

// Team Member Card Component
const TeamMemberCard = ({
  name,
  role,
  description,
  image,
  index = 0,
}: {
  name: string;
  role: string;
  description: string;
  image: string;
  index?: number;
}) => (
  <div
    className={`group glass-card glass-card-hover rounded-2xl overflow-hidden text-white flex flex-col h-full animate-fade-in-up stagger-${(index % 8) + 1
      }`}
  >
    <div className="relative h-64 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <a
          href="#"
          className="w-9 h-9 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-violet-500/50 transition-all"
        >
          <LinkedInIcon className="w-4 h-4" />
        </a>
        <a
          href="#"
          className="w-9 h-9 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-pink-500/50 transition-all"
        >
          <InstagramIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-1">
        {name}
      </h3>
      <p className="text-xs font-semibold text-gray-400 mb-3">{role}</p>
      <p className="text-sm text-gray-300 leading-relaxed flex-grow">
        {description}
      </p>
    </div>
    <div className="h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
  </div>
);

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  const features = [
    {
      icon: <CameraIcon className="w-8 h-8 text-white" />,
      title: "Multi-Face Recognition",
      description:
        "Advanced AI cameras detect and mark attendance for the entire class in seconds.",
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-white" />,
      title: "Real-Time Analytics",
      description:
        "Visualize attendance trends and generate comprehensive reports instantly.",
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
      title: "Secure & Private",
      description:
        "Privacy-first architecture with encrypted face data and secure storage.",
    },
    {
      icon: <CodeBracketIcon className="w-8 h-8 text-white" />,
      title: "Seamless Integration",
      description:
        "Easily syncs with popular LMS like Canvas, Blackboard, and Moodle.",
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      title: "Time-Saving",
      description:
        "Save up to 10 minutes per class while NexAttend handles the admin.",
    },
    {
      icon: <BrainIcon className="w-8 h-8 text-white" />,
      title: "Smart Insights",
      description:
        "AI-driven insights help understand engagement and optimize scheduling.",
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      title: "Student Engagement",
      description:
        "Promote attendance culture with gamified stats and reliable tracking.",
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-white" />,
      title: "Easy to Use",
      description:
        "Intuitive dashboard for teachers, students, and administrators.",
    },
  ];

  const teamMembers = [
    {
      name: "Kumuthu Dahanayake",
      role: "Project Lead, AI & CV Engineer",
      description:
        "Leads NexAttend's direction and develops real-time face recognition using DeepFace and MTCNN.",
      image: kumuthuImg,
    },
    {
      name: "Thisandu Ranadheera",
      role: "Backend Engineer",
      description:
        "Develops server infrastructure, API endpoints, and database connectivity using Node.js.",
      image: thisanduImg,
    },
    {
      name: "Thiviru Igalawithana",
      role: "UI/UX & Frontend Developer",
      description:
        "Designs intuitive interfaces in Figma and implements responsive React components.",
      image: thiviruImg,
    },
    {
      name: "Yasitha Peris",
      role: "System Architect & DevOps",
      description:
        "Designs technical architecture and oversees deployment pipelines for CI/CD workflows.",
      image: yasithaImg,
    },
    {
      name: "Viraj Jayasiri",
      role: "AI & Computer Vision Engineer",
      description:
        "Specializes in facial detection systems and optimizing real-time detection accuracy.",
      image: virajImg,
    },
    {
      name: "Sudam Amarajeewa",
      role: "Backend & Documentation Lead",
      description:
        "Manages backend systems and creates clear technical documentation.",
      image: sudamImg,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative h-screen">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={demoVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900 z-10"></div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-96 h-96 -top-20 -left-20 animate-float-slow"></div>
          <div className="orb orb-pink w-80 h-80 top-1/4 -right-20 animate-float"></div>
          <div className="orb orb-blue w-64 h-64 bottom-20 left-1/4 animate-float-reverse"></div>
        </div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        ></div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="animate-fade-in-down stagger-1 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
              AI-Powered Attendance System
            </span>
          </div>

          <h1 className="animate-fade-in-up stagger-2 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
            NexAttend: Effortless Attendance.
          </h1>
          <h2 className="animate-fade-in-up stagger-3 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-white/90">
            Intelligent Insights.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
              Smarter Classrooms.
            </span>
          </h2>
          <p className="animate-fade-in-up stagger-4 max-w-2xl text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            Automate attendance with AI Multi-Face Detection and transform the
            teaching experience with real-time analytics.
          </p>
          <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-4 md:gap-6">
            <a
              href="#features"
              className="btn-glow bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/30 text-lg"
            >
              Explore Features
            </a>
            <a
              href="#contact"
              className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 hover:border-violet-400/50 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
            >
              Get Started
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in stagger-6">
            <a
              href="#features"
              className="flex flex-col items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors"
            >
              <span className="text-sm">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-violet-400 rounded-full animate-bounce"></div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative py-24 bg-gray-900">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-64 h-64 -top-32 left-1/4 opacity-30"></div>
          <div className="orb orb-pink w-48 h-48 bottom-0 right-1/4 opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 mb-4">
              Why Choose NexAttend?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Experience the future of classroom management with our
              cutting-edge features.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="relative py-24 bg-gray-900/50">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-pink w-96 h-96 top-0 -right-48 opacity-20"></div>
          <div className="orb orb-blue w-80 h-80 bottom-0 -left-40 opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* About Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 mb-4">
              Meet the Team Behind NexAttend
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              We are a passionate team of computer science undergraduates
              building an AI-powered attendance and classroom management system.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  To develop an AI-driven platform that automates classroom
                  attendance, provides detailed analytics, and facilitates
                  communication between teachers and students.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-500"></div>
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-violet-500 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-3">
                  Our Vision
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Promoting digital transformation in education, reducing
                  administrative burden, and encouraging data-driven decisions
                  to improve student engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={member.name}
                name={member.name}
                role={member.role}
                description={member.description}
                image={member.image}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="relative py-24 bg-gray-900">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-[500px] h-[500px] -top-60 -left-60 opacity-30"></div>
          <div className="orb orb-pink w-96 h-96 bottom-0 -right-48 opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Contact Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="text-white">Let's </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
                Connect
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Have questions about NexAttend? Want a demo? We'd love to hear
              from you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Contact Information
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white font-semibold">
                            nexattend@gmail.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Phone</p>
                          <p className="text-white font-semibold">
                            +94 77 123 4567
                          </p>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="pt-6">
                        <p className="text-gray-400 text-sm mb-4">Follow Us</p>
                        <div className="flex gap-3">
                          <a
                            href="#"
                            className="w-11 h-11 glass-card glass-card-hover rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all"
                          >
                            <InstagramIcon className="w-5 h-5" />
                          </a>
                          <a
                            href="#"
                            className="w-11 h-11 glass-card glass-card-hover rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
                          >
                            <LinkedInIcon className="w-5 h-5" />
                          </a>
                          <a
                            href="#"
                            className="w-11 h-11 glass-card glass-card-hover rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                          >
                            <XIcon className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Send a Message
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your Email"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Your Message"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all resize-none"
                          required
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="group w-full bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 hover:from-violet-500 hover:via-pink-500 hover:to-violet-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="relative z-10">Send Message</span>
                        <svg
                          className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
