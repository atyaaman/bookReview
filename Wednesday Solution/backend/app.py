from flask import Flask, jsonify, json, request, send_from_directory
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
    try:
          # Retrieving search parameters
        title_search = request.args.get('title', "")
        author_search = request.args.get('author', "")
        genre_filter = request.args.get('genre')
        page = int(request.args.get('page', 1))
        paid_status_filter = request.args.get('paidStatus', "all")
        query = {}

        if not isinstance(title_search, str) or len(title_search) > 255:
            return jsonify({"error": "Invalid title format or length"}), 400
        if not isinstance(author_search, str) or len(author_search) > 255:
            return jsonify({"error": "Invalid author format or length"}), 400
        if page < 1:
            return jsonify({"error": "Page number should be greater than 0"}), 400
        if paid_status_filter not in ["all", "paid", "free"]:
            return jsonify({"error": "Invalid paid status filter"}), 400

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

        return jsonify(books_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/genres', methods=['GET'])
def get_genres():
    try:
        genres = books_collection.distinct("genre")
        return jsonify(genres)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/book/<string:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    try:
        book = books_collection.find_one({"_id": book_id})
        if not book:
            return jsonify({"message": "Book not found"}), 404

        return jsonify(book)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/book', methods=['POST'])
def create_book():
    try:
        book_data = request.get_json()
        # Insert the document without an _id first
        inserted = books_collection.insert_one({key: book_data[key] for key in book_data if key != '_id'})
        # Convert the inserted_id (ObjectID) to a string and update the document
        str_id = str(inserted.inserted_id)
        books_collection.update_one({"_id": inserted.inserted_id}, {"$set": {"_id": str_id}})
        return jsonify({"_id": str_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/book/<string:book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        updated_data = request.get_json()
        result = books_collection.update_one({"_id": book_id}, {"$set": updated_data})
        if result.matched_count == 0:
            return jsonify({"message": "Book not found"}), 404
        return jsonify({"message": "Book updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/book/<string:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        result = books_collection.delete_one({"_id": book_id})
        if result.deleted_count == 0:
            return jsonify({"message": "Book not found"}), 404
        return jsonify({"message": "Book deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/export', methods=['GET'])
def export_books():
    try:
        format_type = request.args.get('format', 'json')
        cursor = books_collection.find()
        file_name = "exported_books"

        if format_type == 'csv':
            file_name += ".csv"
            keys = ["_id", "book_name", "author", "genre", "paid", "cover_image_url", "publication_date"]
            with open(file_name, 'w', newline='') as output_file:
                dict_writer = csv.DictWriter(output_file, fieldnames=keys)
                dict_writer.writeheader()
                dict_writer.writerows(cursor)
        else:
            file_name += ".json"
            with open(file_name, 'w') as output_file:
                data = [item for item in cursor]
                json.dump(data, output_file)

        return send_from_directory(os.getcwd(), file_name, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/import', methods=['POST'])
def import_books():
    try:
        format_type = request.args.get('format', 'json')
        if 'file' not in request.files:
            return jsonify({"message": "No file provided"}), 400

        uploaded_file = request.files['file']

        if format_type == 'csv':
            csv_file = csv.DictReader(uploaded_file)
            for row in csv_file:
                row['_id'] = (row['_id'])  # Ensure the _id is an integer
                books_collection.insert_one(row)
        else:
            data = json.load(uploaded_file)
            for item in data:
                item['_id'] = (item['_id'])
            books_collection.insert_many(data)
    

        return jsonify({"message": "Books imported successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(500)
def handle_server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)