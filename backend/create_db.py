# create_db.py
from app import db, app  # Importiere die Datenbank und das App-Objekt aus app.py

with app.app_context():
    db.create_all()
    print("Datenbanktabellen erfolgreich erstellt.")
