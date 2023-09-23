const API_ENDPOINT = 'https://book-review-backend-python.onrender.com';

export const fetchBooks = async (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  try {
    const response = await fetch(`${API_ENDPOINT}/books?${queryString}`);
    if (!response.ok) {
      throw new Error('Network response is not ok');
    }
    const data = await response.json();
    return { books: data, error: null };
  } catch (error) {
    return { books: [], error: error.message };
  }
};