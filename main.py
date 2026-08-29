"""
Google Cloud Run & Cloud Buildpacks Entrypoint
Re-exports FastAPI application from server.py
"""

from server import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
