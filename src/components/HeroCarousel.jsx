// src/components/HeroCarousel.jsx
import React from 'react';
import Slider from 'react-slick';

import heroImage1 from '../assets/hero_images/hero1.png'; // Using .webp for better performance
import heroImage2 from '../assets/hero_images/hero2.png';
import heroImage3 from '../assets/hero_images/hero3.png';
import heroImage4 from '../assets/hero_images/hero4.png';

// Array of your hero images
const heroImages = [
  heroImage1,
  heroImage2,
  heroImage3,
  heroImage4,
];


const HeroCarousel = () => {
  const settings = {
    dots: false,         // Show dots for navigation
    infinite: true,     // Loop slides
    speed: 1000,         // Transition speed in ms
    slidesToShow: 1,    // Show one slide at a time
    slidesToScroll: 1,  // Scroll one slide at a time
    autoplay: true,     // Enable autoplay
    autoplaySpeed: 3500, // Autoplay speed in ms (e.g., 3 seconds)
    fade: true,         // Use fade effect for transitions (optional, for a smoother look)
    cssEase: 'linear',  // Type of easing for fade
    pauseOnHover: true, // Pause autoplay on hover
    adaptiveHeight: true // Adjusts slider height to the current slide
  };

  // Placeholder images - replace with your actual images/content later
  const slides = [
    {
      id: 1,
      // Using placehold.co for reliable placeholders. Dimensions: 1200x400 or similar for hero
      imageUrl: heroImage1,
      altText: 'Welcome to ExpertPicks',
      captionTitle: 'Discover Curated Excellence',
      captionText: 'Find top recommendations from trusted experts in various fields.'
    },
    {
      id: 2,
      imageUrl: heroImage2,
      altText: 'Share Your Expertise',
      captionTitle: 'Become a Valued Expert',
      captionText: 'Join our community and guide others with your unique insights.'
    },
    {
      id: 3,
      imageUrl: heroImage3,
      altText: 'Collaborate and Grow',
      captionTitle: 'Connect with Brands',
      captionText: 'Explore collaboration opportunities and expand your reach.'
    }
  ];

  return (
    <div className="w-full relative shadow-lg mb-8 md:mb-12"> {/* Added shadow and bottom margin */}
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-[350px] md:h-[450px] lg:h-[500px] focus:outline-none"> {/* Adjusted height */}
            <img 
              src={slide.imageUrl} 
              alt={slide.altText} 
              className="w-full h-full object-cover" 
            />
            {/* Optional: Overlay for text caption */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 shadow-sm">
                {slide.captionTitle}
              </h2>
              <p className="text-sm md:text-lg text-gray-200 max-w-xl">
                {slide.captionText}
              </p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroCarousel;