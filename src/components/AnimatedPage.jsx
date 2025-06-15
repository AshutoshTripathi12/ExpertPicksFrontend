// src/components/AnimatedPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Start 20px down
  },
  in: {
    opacity: 1,
    y: 0, // Animate to original position
  },
  out: {
    opacity: 0,
    y: -20, // Animate 20px up on exit
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate', // A smooth easing effect
  duration: 0.5,
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;