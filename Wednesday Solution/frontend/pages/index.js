import useBooks from './hooks/useBooks';
import BookComponent from './hooks/useGenres';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("");
    const [paidStatus, setPaidStatus] = useState("all");
    const [page, setPage] = useState(1);

    const fetchNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };
    const fetchPreviousPage = () => {
        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };
    

    const books = useBooks({ title: search, author: search, genre, paidStatus, page });
    const genres = BookComponent();

    return (
        <div className="bg-gradient-to-tr from-purple-300 to-blue-200 min-h-screen p-6">
            <h1 className="text-5xl font-bold mb-10 text-white">Discover Books by: Aman Atya</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
                <div className="mb-6 flex items-center gap-4">
                    <input
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-2 rounded flex-1 shadow-sm"
                    />
                    {/* Genre Selector */}
                    <select value={genre} onChange={(e) => setGenre(e.target.value)} className="border p-2 rounded shadow-sm">
                        <option value="">Select Genre</option>
                        {genres.map(g => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                    {/* Paid Status Selector */}
                    <select value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)} className="border p-2 rounded shadow-sm">
                        <option value="all">All Books</option>
                        <option value="paid">Paid Books</option>
                        <option value="free">Free Books</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {books.map(book => (
                        <Link key={book._id} href={`/book/${book._id}`}>
                            <div className="p-4 border rounded-lg hover:shadow-xl hover:bg-blue-100 cursor-pointer transition transform hover:scale-105 flex items-center">
                                {/* Book Cover Image */}
                                <div className="flex-none mr-4 overflow-hidden rounded-md shadow-lg bg-gray-200 aspect-w-3 aspect-h-4 w-32">
                                    <img src={book.cover_image_url} alt={`${book.title} cover`} className="object-cover w-full h-full" />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-xl font-semibold mb-2 text-blue-600">{book.book_name}</h2>
                                    <p className="text-gray-700 mb-1">By: {book.author}</p>
                                    <p className="text-purple-600 mb-1">{book.genre}</p>
                                    <p className="text-gray-500 mb-1">Published: {book.publication_date}</p>
                                    <p className={book.paid ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                        {book.paid ? 'Paid' : 'Free'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div>
        {/* Previous Page Button - only show if we're not on the first page */}
        {page > 1 && (
            <button
                onClick={fetchPreviousPage}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 mr-4 rounded-full hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md transform transition hover:scale-105 active:scale-95"
            >
                <span className="flex items-center space-x-2">
                    <span>Previous Page</span>
                </span>
            </button>
        )}

        {/* Next Page Button - only show if there are more books to fetch */}
        {books.length > 0 && (
            <button
                onClick={fetchNextPage}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md transform transition hover:scale-105 active:scale-95"
            >
                <span className="flex items-center space-x-2">
                    <span>Next Page</span>
                </span>
            </button>
        )}
    </div>

            </div>
        </div>
    );
}
