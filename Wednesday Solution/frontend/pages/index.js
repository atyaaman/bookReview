import useBooks from './hooks/useBooks';
import BookComponent from './hooks/useGenres';
import Link from 'next/link';
import { useState } from 'react';
import { fetchBooks } from './utility/fetchBooks';
import useSWR from 'swr';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Button } from '@mui/material';
import styled from 'styled-components';



export async function getServerSideProps(context) {
    const search = context.query.title || ""; // Get query parameters, adjust as necessary
    // Similarly fetch other query parameters like author, genre, etc.
    
    const { books, error } = await fetchBooks({ title: search, author : search }); // Adjust the query parameters as necessary

    // If there's an error, return it. Otherwise, return the books
    if (error) {
        return {
            props: { error }
        };
    }
    
    return {
        props: { initialBooks: books }
    };
}

const SearchInput = styled.input`
padding: 0.8rem 1rem;
border: 8px solid #ccc;
border-radius: 10px;
flex: 1;
transition: border-color 0.3s;

&:focus {
    color:black;
    outline: none;
    border-color: #ccc;
    background-color: white;
}
`;

const FilterSelect = styled.select`
    padding: 0.8rem 1rem;
    border: 7px solid #ccc;
    border-radius: 10px;
    margin-left: 10px;
    transition: border-color 0.3s;

&:focus {
    color:white;
    outline: none;
    border-color: #ccc;
    background-color:grey;
}
`;

const fetcher = url => fetch(url).then(r=>r.json());
export default function HomePage({initialBooks}) {
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("");
    const [paidStatus, setPaidStatus] = useState("all");
    const [page, setPage] = useState(1);
    const {data: books = initialBooks, error} = useSWR(
        `https://book-review-backend-python.onrender.com/books?title=${search}&genre=${genre}&paidStatus=${paidStatus}&page=${page}`,
        fetcher,
        {initialData: initialBooks}
    );
    
    const fetchNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };
    const fetchPreviousPage = () => {
        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };
    

   
    const genres = BookComponent();
    
    // Input validation for search
    if (search.length > 100) {
        return <div>Error: Search term is too long!</div>;
    }
    if(error)
    {
        return <div>Error loading books : {error.message}</div>
    }
 
    return (
        <div className="bg-gradient-to-tr from-purple-300 to-blue-200 min-h-screen p-6">
            <h1 className="text-5xl font-bold mb-10 text-white">Discover Books :- By Aman</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
                <div className="mb-6 flex items-center gap-4">
                <SearchInput
                        placeholder="Search by name or author"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        required />
                    {/* Genre Selector */}
                    <FilterSelect value={genre} onChange={(e) => setGenre(e.target.value)}>
                        <option value="">Select Genre</option>
                        {genres.map(g => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </FilterSelect>
                    {/* Paid Status Selector */}
                    <FilterSelect value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)}>
                        <option value="all">All Books</option>
                        <option value="paid">Paid Books</option>
                        <option value="free">Free Books</option>
                    </FilterSelect>
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
            <Button
                            variant="text"
                            color="primary"
                            startIcon={<ArrowBackIosNewIcon />}
                            onClick={fetchPreviousPage}
                            className="mr-4"
                        >
                            Previous Page
                        </Button>

        )}

        {/* Next Page Button - only show if there are more books to fetch */}
        {books.length == 10 && (
            <Button
                            variant="text"
                            color="primary"
                            startIcon={<ArrowForwardIosIcon />}
                            onClick={fetchNextPage}
                            className="mr-4"
                        >
                            Next Page
                        </Button>

        )}
    </div>

            </div>
        </div>
    );
}
