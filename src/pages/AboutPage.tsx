import React from 'react';
import { LinkedInIcon, InstagramIcon, XIcon } from '../components/icons';

import kumuthuImg from '../components/kumuthu.jpg';
import thisanduImg from '../components/thisandu.jpg';
import thiviruImg from '../components/thiviru.jpg';
import yasithaImg from '../components/yasitha.jpg';
import virajImg from '../components/viraj.jpg';
import sudamImg from '../components/sudam.jpg';

const TeamMemberCard = ({
  name,
  role,
  description,
  image,
}: {
  name: string;
  role: string;
  description: string;
  image: string;
}) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 text-gray-900 flex flex-col h-full">
    <div className="h-64 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
      />
    </div>

    <div className="p-6 flex-grow flex flex-col">
      <h3 className="text-xl font-bold text-violet-900 mb-1">{name}</h3>
      <p className="text-sm font-semibold text-gray-600 mb-4">{role}</p>
      <p className="text-sm text-gray-700 leading-relaxed flex-grow">
        {description}
      </p>

      <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
        <a href="#" className="text-gray-500 hover:text-blue-600">
          <LinkedInIcon className="w-5 h-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-pink-600">
          <InstagramIcon className="w-5 h-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-black">
          <XIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
);

const teamMembers = [
  {
    name: "Kumuthu Dahanayake",
    role: "Project Lead, AI & Computer Vision Engineer",
    description:
      "Leads the overall direction of NexAttend while contributing to real-time face recognition models.",
    image: kumuthuImg,
  },
  {
    name: "Thisandu Ranadheera",
    role: "Backend Engineer",
    description:
      "Develops server-side infrastructure, APIs, and AI service integration.",
    image: thisanduImg,
  },
  {
    name: "Thiviru Igalawithana",
    role: "UI/UX Designer & Frontend Developer",
    description:
      "Designs user interfaces and builds responsive frontend components.",
    image: thiviruImg,
  },
  {
    name: "Yasitha Peris",
    role: "System Architect & DevOps Coordinator",
    description:
      "Designs system architecture and manages CI/CD pipelines.",
    image: yasithaImg,
  },
  {
    name: "Viraj Jayasiri",
    role: "AI & Computer Vision Engineer",
    description:
      "Works on facial detection and recognition model optimization.",
    image: virajImg,
  },
  {
    name: "Sudam Amarajeewa",
    role: "Backend Engineer & Documentation Lead",
    description:
      "Handles backend development and prepares technical documentation.",
    image: sudamImg,
  },
];

const AboutPage = () => {
  return (
    <div className="bg-gray-900 min-h-screen">
    </div>
  );
};

