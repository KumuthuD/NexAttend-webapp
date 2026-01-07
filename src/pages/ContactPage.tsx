import React from 'react';
import ContactImg from '../components/Contact.png';
import { InstagramIcon, LinkedInIcon, XIcon } from '../components/icons';

const ContactPage = () => (
    <div className="py-16 px-4 container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold text-pink-500 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-400">We'd love to hear from you. Reach out with questions or for a demo.</p>
        </div>
         <div className="max-w-5xl mx-auto bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-800">
            {/* Left Side - Image */}
            <div className="md:w-5/12 relative">
                <img
                    src={ContactImg}
                    alt="AI Technology"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900/50"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900/50"></div>
            </div>
             {/* Right Side - Form */}
            <div className="md:w-7/12 p-8 md:p-12 bg-[#1a1b2e]">
                <h3 className="text-3xl font-bold text-white mb-8">CONTACT US</h3>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-lg text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your name"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>

        

        
    </div>
);

export default ContactPage;
