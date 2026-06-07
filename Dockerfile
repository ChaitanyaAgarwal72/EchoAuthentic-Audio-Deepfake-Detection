# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Create a non-root user (Hugging Face Spaces prefer non-root users)
RUN useradd -m -u 1000 user

# Set home and working directory
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies required for audio processing
# - ffmpeg: required for yt-dlp, pydub, and some librosa features
# - libsndfile1: required for soundfile/librosa to read/write audio files
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file first to leverage Docker cache
COPY --chown=user backend/requirements.txt $HOME/app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code into the container
COPY --chown=user backend/ $HOME/app/

# Switch to the non-root user
USER user

# Expose port 7860, which is the default port for Hugging Face Spaces
EXPOSE 7860

# Command to run the FastAPI application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
