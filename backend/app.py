from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import logging
from api.Manual_topic_routes import register_manual_topic_routes
from api.Scheduler_routes import register_scheduler_routes
from api.brand_brief_routes import register_brand_brief_routes
from api.routes import register_routes
from api.auth_routes import register_auth_routes
from database import db_manager
import models 
from linkedin_ai.scheduler import scheduler, initialize_scheduler


# Initialize Flask app
app = Flask(__name__, 
            static_folder='../dist',
            template_folder='../dist')

# Enable CORS for all routes
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
])

# Initialise database
db_manager.init_db()

# Register API routes
register_manual_topic_routes(app)
register_scheduler_routes(app)
register_routes(app)
register_auth_routes(app)
register_brand_brief_routes(app)

# Serve React frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path == "":
        return send_from_directory(app.static_folder, 'index.html')
        # send_from_directory already validates path safety
    file_path = os.path.join(app.static_folder, path)
    # if path exists as a file, serve it
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return send_from_directory(app.static_folder, path)
    # Otherwise it's react side client
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO,format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    # Run the app in debug mode during development
    flask_env = os.environ.get('FLASK_ENV', 'development')
    debug = flask_env == 'development'

    if debug:
        print("WARNING: Running in debug mode. Do not use in production.")

    print("Starting scheduler...")
    scheduler.start()
    
    print("Initializing scheduler jobs from database...")
    initialize_scheduler(app)

    # USE 127.0.0.1 for loval dev and 0.0.0.0 for containers
    host = '127.0.0.1' if debug else '0.0.0.0'
    print(f"Starting Flask server on {host}:{port}...")

    app.run(host = host, port = port, debug = debug, use_reloader = False)