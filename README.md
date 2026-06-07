---
title: Echo Authentic API
emoji: 🎙️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# EchoAuthentic - Audio Deepfake Detection

EchoAuthentic is an advanced, full-stack web application designed to detect AI-generated speech. By analyzing the underlying acoustic artifacts of audio files, it can determine with high accuracy whether a voice is human or synthetic.

## 🚀 Features

- **3 Modes of Analysis:** 
  1. **File Upload:** Process existing audio files (`.wav`, `.mp3`, `.flac`).
  2. **YouTube Link:** Fetch and extract audio directly from any YouTube video (Local deployment only).
  3. **Real-Time Live Microphone:** Capture streaming audio directly from your microphone and run real-time inference on the incoming feed.
- **Explainable AI:** It doesn't just give a score. It breaks down the analysis using:
  - Interactive Spectrogram Heatmaps (Mel-spectrograms).
  - Confidence Waterfalls showing per-chunk analysis.
  - A Segment Timeline with clickable playback for high-risk AI segments.
- **Real-Time Streaming:** The backend uses Server-Sent Events (SSE) to stream analysis progress to the frontend in real-time, resulting in a highly responsive UI.

## 🧠 Machine Learning Architecture

The detection pipeline is split into several highly optimized stages:

1. **Voice Activity Detection (VAD):** The backend utilizes `silero-vad` to scan the incoming audio file and isolate segments that actually contain human speech, actively discarding silence or background noise.
2. **Audio Chunking:** The isolated speech is sliced into overlapping 4-second chunks (with a 2-second stride) to ensure maximum context without boundary loss.
3. **Deep Learning Inference:** Each 4-second chunk is converted into a Log-Mel Spectrogram (a visual representation of the audio frequencies). These spectrograms are then passed through our proprietary **Hybrid CNN-BiLSTM model with an Attention mechanism**, executed via `onnxruntime`. The architecture works in three stages:
   - **CNN Layers:** Extract local spectral features from the spectrogram.
   - **Bidirectional LSTM:** Captures temporal dependencies across the audio frames.
   - **Attention Mechanism:** Focuses on the most critical temporal frames containing sub-perceptual synthetic phase artifacts, vocoder glitches, and unnatural frequency cutoffs typical of Generative AI.
4. **Ensemble Scoring:** The predictions from all individual chunks are mathematically aggregated to produce a final, holistic "AI Probability Score" for the entire clip, alongside a robust confidence band.

## ⚠️ Important Limitations: YouTube Extraction

**YouTube link extraction is disabled on cloud deployments (like Hugging Face or AWS).** 

**Why?** YouTube has deployed an extremely aggressive anti-bot system (BotGuard) that actively bans and blacklists datacenter IPs. It requires complex cryptographic signatures (PO Tokens) and authenticated cookies that cannot be reliably generated in a headless Docker container without severely compromising stability. 

**The Solution:** To use the YouTube extraction feature, you **must run the application locally**. YouTube natively trusts residential IP addresses, meaning the local `yt-dlp` extractor will work flawlessly without hitting the "Sign in to confirm you're not a bot" error.

---

## 🛠️ Local Setup Guide

To run this application locally and unlock all features (including YouTube extraction), follow these steps:

### Prerequisites
- Python 3.10+
- Node.js 18+
- `ffmpeg` installed and available in your system PATH.

### 1. Start the Backend (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install the dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start the Frontend (React + Vite)

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install the Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will automatically start on `http://localhost:5173`. Open this URL in your browser, and you are ready to go!

## 📄 License

This project is open-source and available under the standard MIT License.