import firebase_admin
from firebase_admin import firestore


# Initialize Firebase Admin SDK
firebase_admin.initialize_app(
    options={
        "projectId": "cloudplay-513308"
    }
)


# Create Firestore database client
db = firestore.client()