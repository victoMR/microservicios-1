from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId

# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Conectar a MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
print("Connected to MongoDB : " + mongo_uri)
db = client.petsDB
pets_collection = db.pets


@app.route("/")
def index():
    """
    Endpoint inicial que devuelve un mensaje de bienvenida.
    Returns:
        Response: Un mensaje de bienvenida en formato JSON.
    """
    return jsonify({"message": "Hello, World! , go to /pets to see the pets"})

@app.route("/pets", methods=["GET"])
def get_pets():
    """
    Obtener todas las mascotas.
    Returns:
        Response: Una lista de todas las mascotas en formato JSON.
    """
    pets = list(pets_collection.find({}))
    for pet in pets:
        pet["_id"] = str(pet["_id"])
    return jsonify(pets)

@app.route("/pets", methods=["POST"])
def create_pet():
    """
    Crear una nueva mascota.

    Returns:
        Response: La mascota creada en formato JSON.
    """
    pet = request.json
    pet_id = pets_collection.insert_one(pet).inserted_id
    pet["_id"] = str(pet_id)
    return jsonify(pet)

@app.route("/pets/<id>", methods=["PUT"])
def update_pet(id):
    """
    Actualizar una mascota existente.

    Args:
        id (str): El ID de la mascota a actualizar.

    Returns:
        Response: La mascota actualizada en formato JSON.
    """
    pet = request.json
    pets_collection.update_one({"_id": ObjectId(id)}, {"$set": pet})
    pet["_id"] = id
    return jsonify(pet)

@app.route("/pets/<id>", methods=["DELETE"])
def delete_pet(id):
    """
    Eliminar una mascota.

    Args:
        id (str): El ID de la mascota a eliminar.

    Returns:
        Response: Un mensaje de confirmación de eliminación en formato JSON.
    """
    pets_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Pet deleted"})

if __name__ == "__main__":
    # Ejecutar la aplicación en el puerto 5000
    # Host es para que la aplicación sea visible en la red
    # Debug es para reiniciar la aplicación automáticamente al guardar cambios
    app.run(debug=True, host="0.0.0.0", port=5000)
