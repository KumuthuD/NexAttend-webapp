import React from 'react';
import { Link } from 'react-router-dom';
import demoVideo from '../components/signup-page.mp4';

const WebPage = () => {
    return (
        <div className="relative h-screen flex flex-col overflow-hidden">
            {/* Background Video Section */}
            <div className="relative w-full h-full overflow-hidden">
                {/* Video Background */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={demoVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                                </div>
            </div>
    );
};

export default WebPage;