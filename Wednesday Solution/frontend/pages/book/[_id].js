import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
const API_ENDPOINT = 'https://book-review-backend-python.onrender.com';

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
        return <p className="text-lg font-semibold text-center mt-20">Loading...</p>;
    }
    if(book.message === "Book not found")
    {
        return <p className="text-lg font-semibold text-center mt-20">Book not Found</p>;
    }
    
    return (

        <div className="container mx-auto mt-20 p-8 bg-yellow-100 shadow-md rounded-lg flex flex-col md:flex-row justify-between">

            <div className="w-full md:w-1/3 p-4">
                <img src={book.cover_image_url} alt={`${book.title} cover`} className="rounded-md w-full object-cover shadow-lg" />
            </div>
            <div className="w-full md:w-2/3 p-4 ">
                <h1 className="text-4xl font-bold mb-6">{book.title}</h1>
                <p className="text-xl mb-4"><span className="font-semibold">Author:</span> {book.author}</p>
                <p className="text-xl mb-4"><span className="font-semibold">Genre:</span> {book.genre}</p>
                <p className="text-xl mb-4"><span className="font-semibold">Publication Date:</span> {book.publication_date}</p>
                <p className="text-xl mb-4"><span className="font-semibold">Description:</span> {book.description}</p>
                
                <p className="text-xl mb-4"><span className="font-semibold">Type:</span> {book.paid ? 'Paid' : 'Free'}</p>
                
                {/* Add any other details of the book as needed */}
            </div>

        </div>
    );
}
