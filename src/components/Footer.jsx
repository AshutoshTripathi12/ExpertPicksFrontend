// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-text-muted">
          <p className="mb-2 sm:mb-0">
            © {new Date().getFullYear()} ExpertPicks. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-text-main transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-text-main transition-colors">Contact</Link> {/* Example link */}
            <Link to="/privacy" className="hover:text-text-main transition-colors">Privacy Policy</Link> {/* Example link */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;