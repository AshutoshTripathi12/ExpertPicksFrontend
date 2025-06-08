// src/components/PaginationControls.jsx
import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't show controls if there's only one page
  }

  const handlePageClick = (page) => {
    // Page is 0-indexed in backend, but we show 1-indexed to user
    onPageChange(page - 1);
  };

  const pageNumbers = [];
  // Logic to create page numbers with ellipsis for large number of pages
  const createPageNumbers = () => {
    // Show first page, last page, and pages around current page
    const pagesToShow = new Set();
    pagesToShow.add(1); // Always show first page
    if (totalPages > 1) pagesToShow.add(totalPages); // Always show last page

    // Add pages around current page
    for (let i = -1; i <= 1; i++) {
        const page = currentPage + 1 + i;
        if (page > 1 && page < totalPages) {
            pagesToShow.add(page);
        }
    }
    
    // Add ellipsis
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);
    for (let i = 0; i < sortedPages.length; i++) {
        pageNumbers.push(sortedPages[i]);
        if (sortedPages[i+1] && sortedPages[i+1] - sortedPages[i] > 1) {
            pageNumbers.push('...');
        }
    }
    return pageNumbers;
  };

  createPageNumbers();

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 text-sm font-medium text-text-muted bg-background border border-border-color rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page Number Buttons */}
      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm text-text-muted">...</span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentPage + 1 === page
                ? 'bg-primary text-primary-text border border-primary-hover shadow-sm'
                : 'bg-background text-text-muted border border-border-color hover:bg-surface'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage + 1 >= totalPages}
        className="px-4 py-2 text-sm font-medium text-text-muted bg-background border border-border-color rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

export default PaginationControls;