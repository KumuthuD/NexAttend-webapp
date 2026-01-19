import React from 'react';
import { LinkedInIcon, InstagramIcon, XIcon } from '../components/icons';
import kumuthuImg from '../assets/team/kumuthu.jpg';
import thisanduImg from '../assets/team/thisandu.jpg';
import thiviruImg from '../assets/team/thiviru.jpg';
import yasithaImg from '../assets/team/yasitha.jpg';
import virajImg from '../assets/team/viraj.jpg';
import sudamImg from '../assets/team/sudam.jpg';

const TeamMemberCard = ({ name, role, description, image, index = 0 }: { name: string, role: string, description: string, image: string, index?: number }) => (
    <div className={`group glass-card glass-card-hover rounded-2xl overflow-hidden text-white flex flex-col h-full animate-fade-in-up stagger-${(index % 8) + 1}`}>
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden">
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>

            {/* Social icons overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-violet-500/50 hover:border-violet-400 transition-all">
                    <LinkedInIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-pink-500/50 hover:border-pink-400 transition-all">
                    <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-gray-500/50 hover:border-gray-400 transition-all">
                    <XIcon className="w-5 h-5" />
                </a>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-1">
                {name}
            </h3>
            <p className="text-sm font-semibold text-gray-400 mb-4">{role}</p>
            <p className="text-sm text-gray-300 leading-relaxed flex-grow">{description}</p>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
);

const AboutPage = () => {
    const teamMembers = [
        {
            name: "Kumuthu Dahanayake",
            role: "Project Lead, AI & Computer Vision Engineer",
            description: "Leads the overall direction of NexAttend while contributing to the development and integration of real-time face recognition models using DeepFace and MTCNN.",
            image: kumuthuImg
        },
        {
            name: "Thisandu Ranadheera",
            role: "Backend Engineer",
            description: "Develops and maintains the server-side infrastructure, including API endpoints, database connectivity, and integration with the AI service using Node.js and Express.",
            image: thisanduImg
        },
        {
            name: "Thiviru Igalawithana",
            role: "UI/UX Designer & Frontend Developer",
            description: "Designs intuitive user interfaces in Figma and implements responsive, accessible frontend components using React.js and TailwindCSS.",
            image: thiviruImg
        },
        {
            name: "Yasitha Peris",
            role: "System Architect & DevOps Coordinator",
            description: "Designs the technical architecture of the application and oversees deployment pipelines using platforms like Vercel and Railway to ensure smooth CI/CD workflows.",
            image: yasithaImg
        },
        {
            name: "Viraj Jayasiri",
            role: "AI & Computer Vision Engineer",
            description: "Specializes in facial detection and recognition systems, working closely on optimizing model performance and ensuring reliable real-time detection accuracy.",
            image: virajImg
        },
        {
            name: "Sudam Amarajeewa",
            role: "Backend Engineer & Documentation Lead",
            description: "Builds and manages backend systems, databases, and APIs, while also creating clear technical documentation to support development and maintenance.",
            image: sudamImg
        }
    ];

    return (
        <div className="relative bg-gray-900 min-h-screen overflow-hidden">
            {/* Floating Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="orb orb-purple w-[500px] h-[500px] -top-60 -right-60 animate-float-slow"></div>
                <div className="orb orb-pink w-96 h-96 top-1/3 -left-48 animate-float"></div>
                <div className="orb orb-blue w-80 h-80 bottom-0 right-1/4 animate-float-reverse"></div>
            </div>

            {/* Hero Section */}
            <div className="relative py-24 px-4 container mx-auto text-center">
                <div className="animate-fade-in-down stagger-1 mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Our Story
                    </span>
                </div>
                <h2 className="animate-fade-in-up stagger-2 text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 mb-6">
                    About NexAttend
                </h2>
                <p className="animate-fade-in-up stagger-3 text-xl text-gray-400 max-w-2xl mx-auto">
                    Revolutionizing Education Through Technology.
                </p>
                {/* Animated underline */}
                <div className="animate-fade-in stagger-4 mt-8 flex justify-center">
                    <div className="w-32 h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 rounded-full"></div>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="container mx-auto px-4 mb-24">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Mission Card */}
                    <div className="animate-fade-in-left glass-card rounded-3xl p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
                                Our Mission
                            </h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                To design and develop an AI-driven smart web platform that automates classroom attendance, provides detailed analytics,
                                and facilitates communication <span className="font-semibold text-white">between</span> teachers and students in a centralized, user-friendly dashboard.
                            </p>
                        </div>
                    </div>

                    {/* Vision Card */}
                    <div className="animate-fade-in-right glass-card rounded-3xl p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-500"></div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-4">
                                Our Vision
                            </h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                We believe in promoting digital transformation in education, reducing the administrative burden on educators, and
                                encouraging data-driven decisions to improve attendance and student engagement. NexAttend is a scalable, innovative
                                solution aligned with modern digital transformation goals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="container mx-auto px-4 pb-24">
                <div className="text-center mb-16">
                    <h2 className="animate-fade-in-up text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-6">
                        Meet Our Team
                    </h2>
                    <p className="animate-fade-in-up max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
                        We are a passionate and multidisciplinary team of six computer science undergraduates committed to building
                        NexAttend — an AI-powered attendance and classroom management system that enhances the future of education.
                    </p>
                    {/* Animated underline */}
                    <div className="animate-fade-in mt-8 flex justify-center">
                        <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
        </div>
    );
};

export default AboutPage;
