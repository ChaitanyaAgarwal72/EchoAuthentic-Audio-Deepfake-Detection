from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.audio_utils import process_audio

app = FastAPI(
    title="EchoAuthentic API",
    description="Microservice for detecting AI-generated audio deepfakes.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Active", "message": "EchoAuthentic API is running."}

@app.post("/predict/")
async def predict_audio(file: UploadFile = File(...)):
    if not file.filename.endswith(('.wav', '.mp3')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .wav or .mp3")
    
    try:
        audio_bytes = await file.read()
        
        features = process_audio(audio_bytes)
        
        # TODO: Pass features to the ONNX/PyTorch model here
        # For now, we return a mock response to test the connection
        mock_score = 0.85 
        
        return {
            "filename": file.filename,
            "status": "Success",
            "prediction": "AI-Generated" if mock_score > 0.5 else "Human",
            "confidence_score": round(mock_score * 100, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))