import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Nie pokazuj paginacji, jeśli jest tylko jedna strona
  if (totalPages <= 1) {
    return null;
  }

  // Funkcja pomocnicza do tworzenia zakresu stron
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pageNumbers = [];
    
    // Logika dla wyświetlania ograniczonej liczby przycisków stron
    if (totalPages <= maxPagesToShow) {
      // Jeśli liczba stron jest mniejsza niż maksymalna liczba przycisków, pokaż wszystkie strony
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Zawsze pokazuj pierwszą stronę
      pageNumbers.push(1);
      
      // Obliczamy zakres stron do wyświetlenia
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Dostosowanie dla stron na początku
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Dostosowanie dla stron na końcu
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Dodaj wielokropek przed zakresem, jeśli potrzeba
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Dodaj strony z obliczonego zakresu
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Dodaj wielokropek po zakresie, jeśli potrzeba
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Zawsze pokazuj ostatnią stronę
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Obsługa kliknięcia na numer strony
  const handlePageClick = (page) => {
    if (page !== currentPage && page !== '...') {
      onPageChange(page);
    }
  };

  // Obsługa przycisków Poprzednia/Następna
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center">
      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        {/* Przycisk Poprzednia */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
            currentPage === 1
              ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Numery stron */}
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              page === currentPage
                ? 'border-indigo-600 bg-indigo-600 text-white z-10'
                : page === '...'
                ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-default'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Przycisk Następna */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
            currentPage === totalPages
              ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;