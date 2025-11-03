"""
Run script for the Flask backend
This script sets up the necessary environment and runs the Flask server
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path to import the Python scripts
parent_dir = str(Path(__file__).resolve().parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Run the Flask app
from app import app

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    # Run the app in debug mode during development
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    print(f"Starting Flask server on port {port} (debug={debug})")
    print(f"Access the API at http://localhost:{port}/api")
    app.run(host='0.0.0.0', port=port, debug=debug)
