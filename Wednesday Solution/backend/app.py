from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app)

# MongoDB connection string
uri = "mongodb+srv://atyaaman:P8QEOhbFIqR0JUtt@cluster0.kvxxz5i.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Test the MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Reference to the MongoDB collection
db = client["books_db"]
books_collection = db["books"]

@app.route('/books', methods=['GET'])
def get_books():
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
            or_conditions.append({"title": {"$regex": f".*{title_search}.*", "$options": "i"}})
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
    books = books_collection.find(query).skip(skip).limit(10)

    # Return the books data
    return jsonify(list(books))

# Other routes remain the same...

if __name__ == "__main__":
    app.run(debug=True)
