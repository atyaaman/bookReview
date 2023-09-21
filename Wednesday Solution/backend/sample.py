from flask import Flask, jsonify,json, request, send_from_directory
from flask_cors import CORS
import pymongo
import csv
import os

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

@app.route('/book', methods=['POST'])
def create_book():
    book_data = request.get_json()
    book_id = books_collection.insert_one(book_data).inserted_id
    return jsonify(str(book_id)), 201

# Update a book
@app.route('/book/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    updated_data = request.get_json()
    books_collection.update_one({"_id": book_id}, {"$set": updated_data})
    return jsonify({"message": "Book updated successfully"}), 200

# Delete a book
@app.route('/book/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    books_collection.delete_one({"_id": book_id})
    return jsonify({"message": "Book deleted successfully"}), 200

# Fetch book by ID
@app.route('/book/<int:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    book = books_collection.find_one({"_id": book_id})

    if not book:
        return jsonify({"message": "Book not found"}), 404

    return jsonify(book)

# Export books data
@app.route('/export', methods=['GET'])
def export_books():
    format_type = request.args.get('format', 'json')
    cursor = books_collection.find()
    file_name = "exported_books"

    if format_type == 'csv':
        file_name += ".csv"
        keys = ["_id", "book_name", "author", "genre", "paid", "cover_image_url", "publication_date"]
        with open(file_name, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            for row in cursor:
                row['_id'] = int(row['_id'])  # Ensure the _id is an integer
                dict_writer.writerow(row)
    else:
        file_name += ".json"
        with open(file_name, 'w') as output_file:
            data = [item for item in cursor]
            output_file.write(jsonify(data))

    return send_from_directory(os.getcwd(), file_name, as_attachment=True)

# Import books data
@app.route('/import', methods=['POST'])
def import_books():
    format_type = request.args.get('format', 'json')
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400

    uploaded_file = request.files['file']

    if format_type == 'csv':
        csv_file = csv.DictReader(uploaded_file)
        for row in csv_file:
            row['_id'] = int(row['_id'])  # Ensure the _id is an integer
            books_collection.insert_one(row)
    else:
        data = json.load(uploaded_file)
        for item in data:
            item['_id'] = int(item['_id'])
        books_collection.insert_many(data)

    return jsonify({"message": "Books imported successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)
