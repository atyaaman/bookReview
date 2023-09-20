import useBooks from '../hooks/useBooks';
import BookComponent from '../hooks/useGenres';
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
    const books = useBooks({ title: search, author: search, genre, paidStatus, page });
 
    const genres = BookComponent();

    return (
        
        <div className="bg-gradient-to-tr from-purple-300 to-blue-200 min-h-screen p-6">
        <h1 className="text-5xl font-bold mb-10 text-white">Discover Books</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
            <div className="mb-6 flex items-center gap-4">
                <input 
                    placeholder="Search by name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded flex-1 shadow-sm"
                />
                <select 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)} 
                    className="border p-2 rounded shadow-sm"
                >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
                <select 
                    value={paidStatus} 
                    onChange={(e) => setPaidStatus(e.target.value)} 
                    className="border p-2 rounded shadow-sm"
                >
                    <option value="all">All Books</option>
                    <option value="paid">Paid Books</option>
                    <option value="free">Free Books</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                {books.map(book => (
                    <Link key={book._id} href={`/book/${book._id}`}>
                        <div className="p-4 border rounded-lg hover:shadow-xl hover:bg-blue-100 cursor-pointer transition transform hover:scale-105">
                            <h2 className="text-xl font-semibold mb-2 text-blue-600">{book.title}</h2>
                            <p className="text-gray-700 mb-1">By: {book.author}</p>
                            <p className="text-purple-600 mb-1">{book.genre}</p>
                            <p className={book.paid ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                {book.paid ? 'Paid' : 'Free'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            
            <button 
    onClick={fetchNextPage} 
    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md transform transition hover:scale-105 active:scale-95"
>
    <span className="flex items-center space-x-2">
        <span>Load More Books</span>
        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M12.293 9.293L7.586 4.586A1 1 0 0 1 8 3h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1.707.707l-4.586-4.586zM4 8V3a1 1 0 0 1 1.707-.707l4.586 4.586A1 1 0 0 1 9 8H2a1 1 0 0 1-1-1z" />
        </svg>
    </span>
</button>
        </div>
    </div>       

    );
}
