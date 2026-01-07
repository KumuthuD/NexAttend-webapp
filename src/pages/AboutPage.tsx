import React from 'react';
import { LinkedInIcon, InstagramIcon, XIcon } from '../components/icons';
import kumuthuImg from '../assets/team/kumuthu.jpg';
import thisanduImg from '../assets/team/thisandu.jpg';
import thiviruImg from '../assets/team/thiviru.jpg';
import yasithaImg from '../assets/team/yasitha.jpg';
import virajImg from '../assets/team/viraj.jpg';
import sudamImg from '../assets/team/sudam.jpg';

const TeamMemberCard = ({ name, role, description, image }: { name: string, role: string, description: string, image: string }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 text-gray-900 flex flex-col h-full">
        <div className="h-64 overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-violet-900 mb-1">{name}</h3>
            <p className="text-sm font-semibold text-gray-600 mb-4">{role}</p>
            <p className="text-sm text-gray-700 leading-relaxed flex-grow">{description}</p>
            <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors" title="Portfolio">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors" title="LinkedIn"><LinkedInIcon className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-pink-600 transition-colors" title="Instagram"><InstagramIcon className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-black transition-colors" title="X (Twitter)"><XIcon className="w-5 h-5" /></a>
            </div>
        </div>
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
        <div className="bg-gray-900 min-h-screen">
            {/* Hero Section */}
            <div className="py-20 px-4 container mx-auto text-center">
                <h2 className="text-5xl md:text-6xl font-extrabold text-pink-500 mb-4">About NexAttend</h2>
                <p className="text-xl text-gray-400">Revolutionizing Education Through Technology.</p>
            </div>

            {/* Mission & Vision Section */}
            <div className="container mx-auto px-4 mb-24">
                <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-10 relative overflow-hidden">
                    {/* Decorative quotes */}
                    <div className="absolute top-4 right-8 text-7xl text-gray-700/20 font-serif">"</div>

                    <div className="mb-12 relative z-10">
                        <h3 className="text-2xl font-bold text-violet-400 mb-4">Our Mission</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            To design and develop an AI-driven smart web platform that automates classroom attendance, provides detailed analytics,
                            and facilitates communication <span className="font-semibold text-white">between</span> teachers and students in a centralized, user-friendly dashboard.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-pink-500 mb-4">Our Vision</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            We believe in promoting digital transformation in education, reducing the administrative burden on educators, and
                            encouraging data-driven decisions to improve attendance and student engagement. NexAttend is a scalable, innovative
                            solution aligned with modern digital transformation goals, making it a valuable asset for any educational institution.
                        </p>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="container mx-auto px-4 pb-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-pink-500 mb-6">Our Team</h2>
                    <p className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
                        We are a passionate and multidisciplinary team of six computer science undergraduates committed to building
                        NexAttend — an AI-powered attendance and classroom management system. With expertise across AI, backend
                        development, UI/UX design, DevOps, and documentation, we collaborate effectively to deliver a robust, innovative,
                        and real-world-ready solution that enhances the future of education.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {teamMembers.map((member) => (
                        <TeamMemberCard key={member.name} {...member} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
