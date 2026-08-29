# Multi-stage lightweight production container for Google Cloud Run
FROM python:3.13-slim as builder

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.13-slim

WORKDIR /app

# Non-root secure application user
RUN useradd -m -u 1000 appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application files
COPY . .

# Adjust permissions
RUN chown -R appuser:appuser /app

USER appuser

# Expose standard Cloud Run HTTP port
EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
