FROM python:3.11-slim

WORKDIR /app

# Install FFmpeg with drawtext support
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p data/videos data/audio data/assets/backgrounds

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
