import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Mail, Phone, MapPin, Send } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SupportPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [openPrivacy, setOpenPrivacy] = useState<number | null>(null);

    const handleLogout = () => {
        // Functionality for logout if we want to add the top bar button
        logout();
        navigate('/get-started');
    };

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password."
        },
        {
            question: "Can I change my username?",
            answer: "Currently, usernames are fixed to ensure system consistency. However, you can update your display name in the profile settings."
        },
        {
            question: "Is there a mobile app available?",
            answer: "Yes, we have a mobile-responsive web application that works seamlessly on all devices. A dedicated native app is coming soon!"
        },
        {
            question: "How do I contact support?",
            answer: "You can contact our support team via the form below, or email us directly at support@nexattend.com."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenPrivacy(openPrivacy === index ? null : index);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                        Support
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Get help with your account and questions
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-900 rounded-xl transition-all duration-200 font-medium bg-white dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:text-white dark:hover:border-white/20"
                    >
                        Logout
                    </button>
                </div>
            </motion.div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto mb-16 pt-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-6 pb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
                    How can we help you today?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                    Browse our frequently asked questions.
                </p>
            </motion.div>

            {/* Support Categories Section */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {[
                    { title: "Getting Started", icon: "🚀", desc: "New to NexAttend? Start here." },
                    { title: "Account & Billing", icon: "💳", desc: "Manage your account and payments." },
                    { title: "Technical Issues", icon: "🔧", desc: "Troubleshoot bugs and errors." }
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                        className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer group shadow-sm dark:shadow-none"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* FAQ Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto mb-20"
            >
                <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-none"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none hover:cursor-pointer dark:hover:bg-gray-750"
                            >
                                <span className="font-medium text-lg text-gray-900 dark:text-gray-200">{faq.question}</span>
                                {openPrivacy === index ? (
                                    <ChevronUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openPrivacy === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700"
            >
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-10 flex flex-col justify-center bg-blue-50 dark:bg-blue-600/10 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Still need help?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Our support team is always ready to assist you. Reach out to us through any of these channels.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email us at</p>
                                    <p className="font-medium text-gray-900 dark:text-white">nexattend@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-full text-purple-600 dark:text-purple-400">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Call us at</p>
                                    <p className="font-medium text-gray-900 dark:text-white">+94 77 1234 567</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-white dark:bg-gray-800">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Name</label>
                                <input type="text" id="name" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all" placeholder="Your Name" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Email</label>
                                <input type="email" id="email" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all" placeholder="your@email.com" />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Message</label>
                                <textarea id="message" rows={4} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all" placeholder="How can we help?"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-md">
                                <span>Send Message</span>
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default SupportPage;
