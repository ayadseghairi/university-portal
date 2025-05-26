#!/usr/bin/env python3
"""
University Portal Backend Server
Run this file to start the Flask development server
"""

import os
from app import create_app

# Create the Flask application
app = create_app()

if __name__ == '__main__':
    # Get configuration from environment variables
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    
    print("=" * 50)
    print("University Portal Backend Server")
    print("=" * 50)
    print(f"Server starting on http://{host}:{port}")
    print(f"Debug mode: {debug_mode}")
    print("=" * 50)
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True
    )
