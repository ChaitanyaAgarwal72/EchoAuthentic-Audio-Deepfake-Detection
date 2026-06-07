---
title: Echo Authentic API
emoji: 🎙️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---
# EchoAuthentic - Audio Deepfake Detection

EchoAuthentic is a web application designed to detect AI-generated speech. It provides a full-stack solution featuring:
- A FastAPI backend for running deep learning inference using an ONNX model.
- A modern, responsive React frontend.
- Multiple input modes: File Upload, YouTube Link, and Live Microphone detection.
- Detailed visual explainability tools including confidence gauges, waterfall charts, segment playback, and frequency heatmaps.

## Architecture

The project is split into two main components:
- `backend/`: FastAPI application that handles audio processing (VAD, chunking) and runs the ONNX model using ONNX Runtime.
- `frontend/`: React application built with Vite, featuring modular UI components.

## Getting Started

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment.
4. Install dependencies: `pip install -r requirements.txt`
5. Start the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Recent Updates
- Extracted and modularized frontend components for easier maintainability.
- Removed unnecessary comments across the codebase for improved readability.
- Moved utility scripts to the `backend/scripts/` directory.
- Removed unused dependencies (`onnx`, `onnxscript`) from `requirements.txt`.