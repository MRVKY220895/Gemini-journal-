# Entrypoint alias for Google Cloud Run / Google Cloud Buildpacks
from server import app

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
