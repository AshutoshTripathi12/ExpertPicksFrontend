// src/pages/AboutPage.jsx
import React, { useState } from 'react';

const AboutPage = () => {
  // --- Video Playlist Logic ---
  const videoPlaylist = [
    '/assets/Video_Ready_Product_Suggestion.mp4',
   '/assets/Video_Ready_Product_Suggestion.mp4',
    '/assets/Video_Ready_Tech_Content.mp4'
    // You can add more video paths here if you have them
    // '/assets/another-video.mp4', 
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoPlaylist.length);
  };

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Header Section --- */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-main tracking-tight">About ExpertPicks</h1>
          <p className="mt-4 text-lg text-text-muted">
            Connecting passionate experts with curious minds. We believe in the power of genuine, trusted recommendations.
          </p>
        </div>

        {/* --- Video Section --- */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl border border-border-color">
            <video
              key={currentVideoIndex}
              className="w-full h-full object-cover"
              src={videoPlaylist[currentVideoIndex]}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              title="ExpertPicks Platform Video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* --- Text Content Section --- */}
        <div className="prose prose-lg max-w-3xl mx-auto text-text-muted">
          <h2 className="text-text-main">Our Mission</h2>
          <p>
            In a world saturated with sponsored content and biased reviews, finding trustworthy advice is harder than ever. Our mission is to create a community where genuine experts—photographers, chefs, tech enthusiasts, book lovers, and more—can share their favorite products and services, honestly and openly. We provide a platform for discovery, powered by authentic human experience.
          </p>
          
          <h2 className="text-text-main">How It Works</h2>
          <ol>
            <li><strong>Discover Picks:</strong> Browse recommendations from a diverse community of verified experts and brands.</li>
            <li><strong>Share Your Expertise:</strong> Apply to become an expert and share your own top picks with the world.</li>
            <li><strong>Connect & Collaborate:</strong> Verified experts and brands can connect to create unique opportunities and partnerships.</li>
          </ol>
          
          <h2 className="text-text-main">Join Our Community</h2>
          <p>
            Whether you're here to find your next favorite thing or to share your own expertise, we're glad to have you. Together, we can build a more authentic and helpful space for recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;