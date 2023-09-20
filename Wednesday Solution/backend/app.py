from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo

app = Flask(__name__)
CORS(app)

# MongoDB connection string
uri = "mongodb+srv://atyaaman:P8QEOhbFIqR0JUtt@cluster0.kvxxz5i.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = pymongo.MongoClient(uri, server_api=pymongo.server_api.ServerApi('1'))

# Test the MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Reference to the MongoDB collection
db = client["books_db"]
books_collection = db["books"]

@app.route('/books', methods=['GET'])
def get_books():
    # Retrieving search parameters
    title_search = request.args.get('title', "")
    author_search = request.args.get('author', "")
    genre_filter = request.args.get('genre')
    page = int(request.args.get('page', 1))
    paid_status_filter = request.args.get('paidStatus', "all")
    query = {}

    # Handle searching by title and/or author
    if title_search or author_search:
        or_conditions = []
        if title_search:
            or_conditions.append({"book_name": {"$regex": f".*{title_search}.*", "$options": "i"}})
        if author_search:
            or_conditions.append({"author": {"$regex": f".*{author_search}.*", "$options": "i"}})
        query["$or"] = or_conditions

    # Filter by genre and payment status
    if genre_filter:
        query["genre"] = genre_filter
    if paid_status_filter == "paid":
        query["paid"] = True
    elif paid_status_filter == "free":
        query["paid"] = False

    # Pagination setup
    skip = (page - 1) * 10
    books = (books_collection.find(query, {"book_name": 1, "author": 1, "genre": 1, "paid": 1, "cover_image_url": 1, "publication_date": 1})
                            .sort("publication_date", -1)  # Sort by publication_date in descending order
                            .skip(skip).limit(10))

    # Convert query result to list of dictionaries
    books_list = [book for book in books]

    # Return the books data
    return jsonify(books_list)

# Other routes can be added as necessary
@app.route('/genres', methods=['GET'])
def get_genres():
    genres = books_collection.distinct("genre")
    return jsonify(genres)

@app.route('/book/<string:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    book = books_collection.find_one({"_id": book_id})

    if not book:
        return jsonify({"message": "Book not found"}), 404

    return jsonify(book)


if __name__ == "__main__":
    app.run(debug=True)
