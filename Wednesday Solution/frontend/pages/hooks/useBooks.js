import { useState, useEffect } from 'react';

const API_ENDPOINT = 'https://book-review-backend-python.onrender.com';

function useBooks(searchParams) {
    const [books, setBooks] = useState([]);

    // Convert searchParams object to a query string.
    const queryString = new URLSearchParams(searchParams).toString();

    useEffect(() => {
        fetch(`${API_ENDPOINT}/books?${queryString}`)
            .then((response) => response.json())
            .then((data) => setBooks(data));
    }, [queryString]); // Update the dependency to queryString

    return books;
}

export default useBooks;
