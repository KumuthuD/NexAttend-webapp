import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import MouseFollower from "../components/MouseFollower";
import FeatureCard from "../components/FeatureCard";
import TechMarquee from "../components/TechMarquee";
import { LinkedInIcon, InstagramIcon, XIcon } from "../components/icons";
import kumuthuImg from "../assets/team/kumuthu.jpg";
import thisanduImg from "../assets/team/thisandu.jpeg";
import thiviruImg from "../assets/team/thiviru.jpeg";
import yasithaImg from "../assets/team/yasitha.jpeg";
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

// ===== SCROLL REVEAL HOOK =====
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .step-line, .progress-bar-fill"
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ===== ANIMATED COUNTER =====
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ===== TYPING EFFECT =====
function TypingText({ texts }: { texts: string[] }) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "deleting">("typing");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = texts[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (charIdx < current.length) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, 60);
      } else {
        timeout = setTimeout(() => setPhase("waiting"), 1800);
      }
    } else if (phase === "waiting") {
      timeout = setTimeout(() => setPhase("deleting"), 400);
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, 35);
      } else {
        setIdx((i) => (i + 1) % texts.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, charIdx, idx, texts]);

  return <span className="typing-cursor">{displayed}</span>;
}

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
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -8;
    const ry = ((x - cx) / cx) * 8;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      cardRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(frameRef.current);
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.1s ease-out';
  };

  const gradients = [
    'from-violet-500 to-pink-500',
    'from-pink-500 to-orange-400',
    'from-cyan-500 to-violet-500',
    'from-violet-500 to-blue-500',
    'from-emerald-500 to-cyan-500',
    'from-pink-500 to-violet-500',
  ];
  const grad = gradients[index % gradients.length];

  return (
    <div className="reveal h-full" style={{ transitionDelay: `${index * 0.1}s` }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="group relative rounded-3xl overflow-hidden text-white flex flex-col h-full"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          willChange: 'transform',
        }}
      >
        {/* Animated gradient border on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            padding: '1px',
            background: `linear-gradient(135deg, rgba(139,92,246,0.5), rgba(236,72,153,0.5))`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Mouse spotlight glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
          style={{
            background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(139,92,246,0.12), transparent 60%)',
          }}
        />

        {/* Image area */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
            style={{ transform: 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {/* Multi-stop gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />

          {/* Floating role badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${grad} text-white shadow-lg`}>
              {role.split(' ')[0]}
            </span>
          </div>

          {/* Social icons — slide up on hover */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2.5 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <a href="#" className="w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-[#0077b5]/70 hover:border-[#0077b5]/50 hover:scale-110 transition-all duration-200">
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500/70 hover:to-violet-500/70 hover:border-pink-400/50 hover:scale-110 transition-all duration-200">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-110 transition-all duration-200">
              <XIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Avatar ring — overlaps image and body */}
        <div className="relative -mt-10 flex justify-start px-5 z-10">
          <div className="relative">
            {/* Animated gradient ring */}
            <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-r ${grad} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
              style={{ animation: 'arcSpin 6s linear infinite' }} />
            <img
              src={image}
              alt={name}
              className="relative w-16 h-16 rounded-full object-cover object-top border-2 border-gray-900"
            />
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-gray-900" />
          </div>
        </div>

        {/* Card body */}
        <div className="px-5 pt-3 pb-6 flex-grow flex flex-col">
          <h3 className={`text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${grad} mb-0.5`}>
            {name}
          </h3>
          <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1.5">
            <span className="w-3.5 h-px bg-gradient-to-r from-violet-500 to-pink-500 inline-block rounded" />
            {role}
          </p>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed flex-grow transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Bottom animated gradient bar */}
        <div className={`h-[3px] bg-gradient-to-r ${grad} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-600 origin-left`} />
      </div>
    </div>
  );
};



const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [pricingYearly, setPricingYearly] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  useScrollReveal();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendState("sending");
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject || "NexAttend Contact Form",
          message: formData.message,
          to_email: "nexattendlk@gmail.com",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setSendState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSendState("idle"), 5000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setSendState("error");
      setTimeout(() => setSendState("idle"), 5000);
    }
  };

  const features = [
    {
      icon: <CameraIcon className="w-8 h-8 text-white" />,
      title: "Multi-Face Recognition",
      description: "Advanced AI cameras detect and mark attendance for the entire class in seconds.",
      tag: "AI", tagColor: "violet",
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-white" />,
      title: "Real-Time Analytics",
      description: "Visualize attendance trends and generate comprehensive reports instantly.",
      tag: "Data", tagColor: "blue",
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
      title: "Secure & Private",
      description: "Privacy-first architecture with encrypted face data and secure storage.",
      tag: "Security", tagColor: "green",
    },
    {
      icon: <CodeBracketIcon className="w-8 h-8 text-white" />,
      title: "Seamless Integration",
      description: "Easily syncs with popular LMS like Canvas, Blackboard, and Moodle.",
      tag: "API", tagColor: "cyan",
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      title: "Time-Saving",
      description: "Save up to 10 minutes per class while NexAttend handles the admin.",
      tag: "Speed", tagColor: "amber",
    },
    {
      icon: <BrainIcon className="w-8 h-8 text-white" />,
      title: "Smart Insights",
      description: "AI-driven insights help understand engagement and optimize scheduling.",
      tag: "AI", tagColor: "violet",
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      title: "Student Engagement",
      description: "Promote attendance culture with gamified stats and reliable tracking.",
      tag: "UX", tagColor: "pink",
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-white" />,
      title: "Easy to Use",
      description: "Intuitive dashboard for teachers, students, and administrators.",
      tag: "Design", tagColor: "pink",
    },
  ];

  const teamMembers = [
    {
      name: "Kumuthu Dahanayake",
      role: "Team Lead, AI Integration",
      description:
        "Leads NexAttend's direction and develops real-time face recognition using DeepFace and MTCNN.",
      image: kumuthuImg,
    },
    {
      name: "Thisandu Ranadheera",
      role: "Backend Developer",
      description:
        "Develops server infrastructure, API endpoints, and database connectivity using Node.js.",
      image: thisanduImg,
    },
    {
      name: "Thiviru Igalawithana",
      role: "UI/UX & Frontend Lead",
      description:
        "Designs intuitive interfaces in Figma and implements responsive React components.",
      image: thiviruImg,
    },
    {
      name: "Yasitha Peris",
      role: "Frontend Developer",
      description:
        "Creates responsive and user-friendly web experiences.",
      image: yasithaImg,
    },
    {
      name: "Viraj Jayasiri",
      role: "AI & Computer Vision",
      description:
        "Specializes in facial detection systems and optimizing real-time detection accuracy.",
      image: virajImg,
    },
    {
      name: "Sudam Amarajeewa",
      role: "Backend Lead",
      description:
        "Manages backend systems and creates clear technical documentation.",
      image: sudamImg,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <MouseFollower />
      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative min-h-screen bg-gray-900 pt-20 md:pt-24 flex flex-col justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-900/20 to-gray-900"></div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-96 h-96 -top-20 -left-20 animate-float-slow"></div>
          <div className="orb orb-pink w-80 h-80 top-1/4 -right-20 animate-float"></div>
          <div className="orb orb-blue w-64 h-64 bottom-20 left-1/4 animate-float-reverse"></div>
        </div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        ></div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 flex-grow flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
            <div className="animate-fade-in-down stagger-1 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
                AI-Powered Attendance System
              </span>
            </div>

            <h1 className="animate-fade-in-up stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
              NexAttend: Effortless Attendance.
            </h1>
            <h2 className="animate-fade-in-up stagger-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6 md:mb-8 text-white/90 max-w-4xl mx-auto">
              Intelligent Insights.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                <TypingText texts={["Smarter Classrooms.", "Happier Teachers.", "Better Outcomes.", "Instant Insights."]} />
              </span>
            </h2>
            <p className="animate-fade-in-up stagger-4 max-w-2xl text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
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
              <Link
                to="/get-started"
                className="group relative bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-violet-600/20 backdrop-blur-md text-white font-bold py-4 px-10 rounded-full transition-all duration-500 transform hover:scale-110 text-lg flex items-center justify-center gap-3 overflow-hidden"
                style={{
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)',
                  animation: 'buttonGlow 3s ease-in-out infinite',
                }}
              >
                {/* Animated gradient border */}
                <span
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6, #ec4899, #8b5cf6)',
                    backgroundSize: '300% 100%',
                    animation: 'borderGradient 4s linear infinite',
                  }}
                >
                  <span className="block w-full h-full rounded-full bg-gray-900/90 backdrop-blur-md"></span>
                </span>

                {/* Shimmer sweep effect */}
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                ></span>

                {/* Sparkle particles */}
                <span className="absolute top-1 right-4 w-1 h-1 bg-violet-400 rounded-full animate-ping opacity-75"></span>
                <span className="absolute bottom-2 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></span>
                <span className="absolute top-3 left-10 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></span>

                {/* Button text */}
                <span className="relative z-10 bg-gradient-to-r from-violet-300 via-pink-300 to-violet-300 bg-clip-text text-transparent font-extrabold tracking-wide group-hover:from-white group-hover:via-pink-200 group-hover:to-white transition-all duration-300">
                  Get Started
                </span>

                {/* Animated arrow */}
                <span className="relative z-10 flex items-center">
                  <svg
                    className="w-5 h-5 text-violet-400 group-hover:text-pink-400 group-hover:translate-x-2 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* ===== STATS BAR ===== */}
      <section className="relative py-16 bg-gray-900/80 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-pink-600/5 to-violet-600/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 95, suffix: "%", label: "Detection Accuracy", icon: "🎯" },
              { value: 50, suffix: "+", label: "Students Tracked", icon: "🎓" },
              { value: 10, suffix: "+", label: "Active Classrooms", icon: "🏫" },
              { value: 2000, suffix: "ms", label: "Avg. Detection Time", icon: "⚡" },
            ].map((stat, i) => (
              <div key={i} className="reveal text-center group" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      < section id="features" className="relative py-24 bg-gray-900" >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-purple w-64 h-64 -top-32 left-1/4 opacity-30"></div>
          <div className="orb orb-pink w-48 h-48 bottom-0 right-1/4 opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                Powerful Features
              </span>
            </div>
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

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Top row: big hero card left + 2x2 grid right */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Hero feature card — left, taller */}
              <div className="lg:w-1/2 xl:w-5/12 min-h-[360px]">
                <div className="group relative glass-card rounded-2xl p-10 h-full flex flex-col items-center justify-center text-center overflow-hidden card-3d reveal"
                  style={{ transitionDelay: '0s' }}>
                  {/* Category tag */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-violet-500/20 text-violet-300 border-violet-500/30">
                    {features[0].tag}
                  </div>
                  {/* Spotlight */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-2xl"
                    style={{ background: 'radial-gradient(400px circle at 50% 50%, rgba(139,92,246,0.18), transparent 60%)' }} />
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Floating orb behind icon */}
                  <div className="absolute w-32 h-32 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150 mb-8" />
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/40 group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 to-transparent" />
                      <div className="relative z-10">{features[0].icon}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-pink-300 transition-all duration-300 mb-3">
                    {features[0].title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed max-w-xs">
                    {features[0].description}
                  </p>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 group-hover:w-4/5 transition-all duration-700 rounded-full" />
                </div>
              </div>

              {/* Right side: 2x2 grid */}
              <div className="lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {features.slice(1, 5).map((feature, index) => (
                  <FeatureCard key={feature.title} {...feature} index={index + 1} />
                ))}
              </div>
            </div>

            {/* Bottom row: uniform 4 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.slice(5).map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index + 5} />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* ===== TECH STACK MARQUEE ===== */}
      <TechMarquee />

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="relative py-24 bg-gray-900/60">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-violet w-72 h-72 top-10 -right-36 opacity-20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 mb-4">Three Simple Steps</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Get up and running in minutes — no complex setup required.</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line - desktop */}
              <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 step-line" />
              {[
                { step: "01", title: "Register Students", desc: "Upload a photo once. NexAttend trains a unique face vector for every student automatically.", icon: "👤", color: "from-violet-500 to-purple-600" },
                { step: "02", title: "Start Class Session", desc: "Press a single button. The AI camera scans the room and identifies every face in under 3 seconds.", icon: "📷", color: "from-purple-500 to-pink-600" },
                { step: "03", title: "View Analytics", desc: "Attendance is recorded, reports are generated, and insights are ready — instantly on your dashboard.", icon: "📊", color: "from-pink-500 to-violet-600" },
              ].map((item, i) => (
                <div key={i} className="reveal text-center" style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div className="relative inline-flex flex-col items-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-5 group hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 border-2 border-violet-500/50 rounded-full flex items-center justify-center text-xs font-black text-violet-400">{item.step}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="relative py-24 bg-gray-900">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-pink w-80 h-80 -top-20 -left-20 opacity-15" />
          <div className="orb orb-violet w-64 h-64 bottom-10 right-10 opacity-15" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm font-medium mb-6">
              ⭐ Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 mb-4">Loved by Educators</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Hear from the teachers and admins who use NexAttend every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Dr. Priya Nair", role: "Professor, Computer Science", avatar: "P", color: "from-violet-500 to-pink-500", stars: 5, text: "NexAttend cut my attendance routine from 8 minutes to literally zero. I walk in, start the session, and it's done. Absolutely brilliant." },
              { name: "James Kowalski", role: "Academic Director", avatar: "J", color: "from-pink-500 to-orange-400", stars: 5, text: "The analytics dashboard gives us a bird's-eye view of campus-wide attendance we never had before. Decision-making is so much faster now." },
              { name: "Amara Osei", role: "Head of IT, University", avatar: "A", color: "from-cyan-500 to-violet-500", stars: 5, text: "Integration was seamless. We connected it with our existing LMS in an afternoon. The AI accuracy is genuinely impressive — over 97% on day one." },
            ].map((t, i) => (
              <div key={i} className="reveal glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-500" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, s) => <span key={s} className="text-amber-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEMO VIDEO SECTION ===== */}
      < section id="demo" className="relative py-24 bg-gray-900" >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-violet w-96 h-96 top-0 -left-48 opacity-20"></div>
          <div className="orb orb-pink w-80 h-80 bottom-0 -right-40 opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Demo Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Product Demo
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 mb-4">
              See NexAttend in Action
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Watch how our AI-powered attendance system transforms classroom management in real-time.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full"></div>
            </div>
          </div>

          {/* Demo Video */}
          <div className="max-w-5xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <iframe
                    className="w-full aspect-video rounded-2xl"
                    src="https://www.youtube.com/embed/Sw7HK_C15rA"
                    title="NexAttend Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ===== PRICING SECTION ===== */}
      < section id="pricing" className="relative py-24 bg-gray-900/50" >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-pink w-96 h-96 top-0 -right-48 opacity-20"></div>
          <div className="orb orb-blue w-80 h-80 bottom-0 -left-40 opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Pricing Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Pricing Plans
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Flexible pricing options for institutions of all sizes. Start free or scale as you grow.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full"></div>
            </div>
            {/* Monthly / Yearly Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold transition-colors ${!pricingYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setPricingYearly(!pricingYearly)}
                className="relative w-14 h-7 rounded-full bg-gray-700 border border-white/10 transition-colors duration-300 focus:outline-none"
                style={{ backgroundColor: pricingYearly ? 'rgba(139,92,246,0.6)' : undefined }}
                aria-label="Toggle billing period"
              >
                <div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                  style={{ left: pricingYearly ? 'calc(100% - 1.5rem)' : '0.25rem' }}
                />
              </button>
              <span className={`text-sm font-semibold transition-colors ${pricingYearly ? 'text-white' : 'text-gray-500'}`}>
                Yearly
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">

              {/* Starter Plan */}
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 flex flex-col">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                  <p className="text-gray-400 text-sm mb-8">Perfect for small classrooms</p>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-white">Free</span>
                    <p className="text-gray-500 text-sm mt-2">No credit card required</p>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {["Up to 30 students", "Basic face recognition", "30-day data retention", "Email support"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/get-started" className="mt-auto block w-full text-center py-4 px-6 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50 text-white font-semibold rounded-2xl transition-all duration-300">
                    Get Started Free
                  </Link>
                </div>
              </div>

              {/* Professional Plan */}
              <div className="relative group h-full md:-mt-4 md:mb-4">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 rounded-3xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-xl shadow-violet-500/40">
                    <SparklesIcon className="w-4 h-4" />
                    MOST POPULAR
                  </span>
                </div>
                <div className="relative h-full bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-violet-500/50 transition-all duration-500 flex flex-col">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 mt-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-2">Professional</h3>
                  <p className="text-gray-400 text-sm mb-8">For growing institutions</p>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">${pricingYearly ? '39' : '49'}</span>
                      <span className="text-xl text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">{pricingYearly ? 'Billed yearly — save $120/yr' : 'Billed monthly'}</p>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {["Up to 200 students", "Advanced AI recognition", "Unlimited data retention", "Real-time analytics", "Priority 24/7 support"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/get-started" className="mt-auto block w-full text-center py-4 px-6 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02]">
                    Start 14-Day Free Trial
                  </Link>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-pink-500/30 transition-all duration-500 flex flex-col">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-2">Enterprise</h3>
                  <p className="text-gray-400 text-sm mb-8">For large organizations</p>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-white">Custom</span>
                    <p className="text-gray-500 text-sm mt-2">Tailored to your needs</p>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {["Unlimited students & classes", "Custom AI model training", "LMS & SSO integration", "Dedicated success manager", "99.9% SLA guarantee"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className="mt-auto block w-full text-center py-4 px-6 bg-gradient-to-r from-pink-600/20 to-violet-600/20 hover:from-pink-600/30 hover:to-violet-600/30 border border-pink-500/30 hover:border-pink-500/50 text-white font-semibold rounded-2xl transition-all duration-300">
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ===== ABOUT SECTION ===== */}
      < section id="about" className="relative py-24 bg-gray-900/50" >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-pink w-96 h-96 top-0 -right-48 opacity-20"></div>
          <div className="orb orb-blue w-80 h-80 bottom-0 -left-40 opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* About Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Our Team
              </span>
            </div>
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
      </section >

      {/* ===== CONTACT SECTION ===== */}
      < section id="contact" className="relative py-28 bg-gray-900 overflow-hidden" >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-purple w-[500px] h-[500px] -top-60 -left-60 opacity-25" />
          <div className="orb orb-pink w-96 h-96 bottom-0 -right-48 opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.04),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
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
              Have questions about NexAttend? Want a live demo? Drop us a message — we respond fast.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <div className="lg:col-span-2 reveal space-y-5" style={{ transitionDelay: '0.05s' }}>

              {/* Response-time badge */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <p className="text-emerald-300 text-sm font-semibold">Average response time: <span className="text-white">&lt; 4 hours</span></p>
              </div>

              {/* Contact info tiles */}
              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  grad: 'from-violet-500 to-pink-500',
                  label: 'Email us',
                  value: 'nexattendlk@gmail.com',
                  sub: 'For general and support queries',
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  grad: 'from-emerald-500 to-cyan-500',
                  label: 'Call us',
                  value: '+94 77 123 4567',
                  sub: 'Mon–Fri, 9 am – 6 pm IST',
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  grad: 'from-pink-500 to-orange-400',
                  label: 'Find us',
                  value: 'Colombo, Sri Lanka',
                  sub: 'IIT | Informatics Institute of Technology',
                },
              ].map((item, i) => (
                <div key={i}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300 cursor-default">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-white font-semibold text-sm truncate">{item.value}</p>
                    <p className="text-gray-500 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Social chips */}
              <div className="pt-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Follow us</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { href: 'https://www.instagram.com/nexattend', label: 'Instagram', icon: <InstagramIcon className="w-4 h-4" />, hover: 'hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-yellow-500/30 hover:border-pink-400/40 hover:text-pink-300' },
                    { href: 'https://www.linkedin.com/company/nexattend/', label: 'LinkedIn', icon: <LinkedInIcon className="w-4 h-4" />, hover: 'hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 hover:text-blue-300' },
                    { href: '#', label: 'X', icon: <XIcon className="w-4 h-4" />, hover: 'hover:bg-white/10 hover:border-white/30 hover:text-white' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-400 text-xs font-semibold transition-all duration-300 ${s.hover} hover:scale-105`}>
                      {s.icon} {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: FORM ── */}
            <div className="lg:col-span-3 reveal" style={{ transitionDelay: '0.15s' }}>
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}>

                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500" />

                {/* Inner glow blobs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-8 md:p-10">
                  <h3 className="text-2xl font-bold text-white mb-1">Send a Message</h3>
                  <p className="text-gray-500 text-sm mb-8">Fill in the form — we'll be in touch shortly.</p>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Email row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Floating label — Name */}
                      <div className="relative group/field">
                        <input
                          type="text"
                          name="name"
                          id="cf-name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder=" "
                          className="peer w-full bg-white/[0.05] border border-white/10 rounded-xl pt-6 pb-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/70 focus:bg-white/[0.08] transition-all duration-300"
                          style={{ boxShadow: 'none' }}
                          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        />
                        <label htmlFor="cf-name"
                          className="absolute left-4 top-4 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-violet-400 peer-focus:font-semibold peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-400 peer-not-placeholder-shown:font-semibold">
                          Your Name
                        </label>
                      </div>

                      {/* Floating label — Email */}
                      <div className="relative group/field">
                        <input
                          type="email"
                          name="email"
                          id="cf-email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder=" "
                          className="peer w-full bg-white/[0.05] border border-white/10 rounded-xl pt-6 pb-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/70 focus:bg-white/[0.08] transition-all duration-300"
                          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        />
                        <label htmlFor="cf-email"
                          className="absolute left-4 top-4 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-violet-400 peer-focus:font-semibold peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-400 peer-not-placeholder-shown:font-semibold">
                          Email Address
                        </label>
                      </div>
                    </div>

                    {/* Subject selector */}
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3.5 px-4 text-gray-400 text-sm focus:outline-none focus:border-violet-500/70 focus:text-white transition-all duration-300 appearance-none cursor-pointer"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                        onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <option value="" disabled style={{ background: '#1a1030', color: '#9ca3af' }}>What's this about?</option>
                        <option value="demo"        style={{ background: '#1a1030', color: '#e2e8f0' }}>📅  Request a Demo</option>
                        <option value="pricing"     style={{ background: '#1a1030', color: '#e2e8f0' }}>💳  Pricing &amp; Plans</option>
                        <option value="support"     style={{ background: '#1a1030', color: '#e2e8f0' }}>🛠️   Technical Support</option>
                        <option value="partnership" style={{ background: '#1a1030', color: '#e2e8f0' }}>🤝  Partnership Inquiry</option>
                        <option value="other"       style={{ background: '#1a1030', color: '#e2e8f0' }}>💬  Other</option>
                      </select>
                      {/* Chevron */}
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Message with character counter */}
                    <div className="relative">
                      <textarea
                        name="message"
                        id="cf-message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        placeholder=" "
                        maxLength={500}
                        className="peer w-full bg-white/[0.05] border border-white/10 rounded-xl pt-6 pb-8 px-4 text-white text-sm focus:outline-none focus:border-violet-500/70 focus:bg-white/[0.08] transition-all duration-300 resize-none"
                        onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; }}
                        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                      />
                      <label htmlFor="cf-message"
                        className="absolute left-4 top-4 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-violet-400 peer-focus:font-semibold peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-400 peer-not-placeholder-shown:font-semibold">
                        Your Message
                      </label>
                      {/* Character counter */}
                      <p className="absolute bottom-3 right-4 text-[10px] text-gray-600 pointer-events-none tabular-nums">
                        {formData.message.length}/500
                      </p>
                    </div>

                    {/* Submit button — stateful */}
                    <button
                      type="submit"
                      disabled={sendState === "sending"}
                      className={`group relative w-full overflow-hidden text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                        sendState === "success"
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30 scale-[1.01]'
                          : sendState === "error"
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/30'
                          : sendState === "sending"
                          ? 'bg-gradient-to-r from-violet-600/80 via-purple-600/80 to-pink-600/80 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {/* Shimmer sweep — idle only */}
                      {sendState === 'idle' && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      )}

                      {sendState === 'sending' && (
                        <>
                          <svg className="relative z-10 w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="relative z-10 tracking-wide">Sending…</span>
                        </>
                      )}
                      {sendState === 'success' && (
                        <>
                          <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="relative z-10 tracking-wide">Message Sent! 🎉</span>
                        </>
                      )}
                      {sendState === 'error' && (
                        <>
                          <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="relative z-10 tracking-wide">Failed — try again</span>
                        </>
                      )}
                      {sendState === 'idle' && (
                        <>
                          <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span className="relative z-10 tracking-wide">Send Message</span>
                        </>
                      )}
                    </button>

                    {/* Privacy note */}
                    <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Your information is encrypted and never shared.
                    </p>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section >

    </div >
  );
};

export default LandingPage;
