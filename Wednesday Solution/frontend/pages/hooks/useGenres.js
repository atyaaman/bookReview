import { useState, useEffect } from 'react';

const API_ENDPOINT = 'http://localhost:5000';

function BookComponent() {
    const [genres, setGenres] = useState([]);
    
    useEffect(() => {
        fetch(`${API_ENDPOINT}/genres`)
        // fetch('/genres')  // Adjust the URL if needed
        .then(response => response.json())
        .then(data => setGenres(data))
        .catch(error => console.error('Error fetching genres:', error));
    }, []);

    return genres;
}

export default BookComponent;
