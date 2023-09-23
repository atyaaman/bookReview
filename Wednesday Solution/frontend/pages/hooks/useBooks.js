import { useState, useEffect } from 'react';
import { fetchBooks } from '../utility/fetchBooks';
// const API_ENDPOINT = 'https://book-review-backend-python.onrender.com';

function useBooks(searchParams) {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
   
    useEffect(() => {
    const fetchAndSetBooks = async () => {
      const result = await fetchBooks(searchParams);
      setBooks(result.books);
      setError(result.error);
    };
    fetchAndSetBooks();
  }, [searchParams]);

  return { books, error };
}

export default useBooks;