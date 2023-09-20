import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const API_ENDPOINT = 'http://localhost:5000';

export default function BookDetail() {
    const router = useRouter();
    const { _id } = router.query;

    const [book, setBook] = useState(null);

    useEffect(() => {
        if (_id) {
            fetch(`${API_ENDPOINT}/book/${_id}`)
                .then((response) => response.json())
                .then((data) => setBook(data));
        }
    }, [_id]);

    if (!book) {
        return <p className="text-lg font-semibold">Loading...</p>;
    }

    return (
        <div className="container mx-auto mt-12 p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <p className="text-xl mb-2"><span className="font-semibold">Author:</span> {book.author}</p>
            <p className="text-xl mb-2"><span className="font-semibold">Genre:</span> {book.genre}</p>
            <p className="text-xl mb-2"><span className="font-semibold">Type:</span> {book.paid ? 'Paid' : 'Free'}</p>
            <p className="text-gray-700">{book.details}</p>
        </div>
    );
}
