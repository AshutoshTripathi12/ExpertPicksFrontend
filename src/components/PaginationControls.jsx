// src/components/PaginationControls.jsx
import React from 'react';
import Button from './Button'; // Use our styled button

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't show controls if there's only one page
  }

  const handlePrev = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-8 py-4">
      <Button onClick={handlePrev} disabled={currentPage === 0} variant="secondary">
        Previous
      </Button>
      <span className="text-sm text-text-muted">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button onClick={handleNext} disabled={currentPage >= totalPages - 1} variant="secondary">
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;