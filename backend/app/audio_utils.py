import librosa
import numpy as np
import io

def process_audio(file_bytes: bytes) -> np.ndarray:
    """
    Takes raw audio bytes, converts to a Mel-spectrogram, 
    and formats it for the deep learning model.
    """
    audio_data, sample_rate = librosa.load(io.BytesIO(file_bytes), sr=16000)
    
    target_length = 64000
    if len(audio_data) > target_length:
        audio_data = audio_data[:target_length]
    else:
        padding = target_length - len(audio_data)
        audio_data = np.pad(audio_data, (0, padding), 'constant')
        
    mel_spectrogram = librosa.feature.melspectrogram(
        y=audio_data, 
        sr=sample_rate, 
        n_mels=128, 
        fmax=8000
    )
    
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)
    
    formatted_input = np.expand_dims(mel_spectrogram_db, axis=(0, 1))
    
    return formatted_input.astype(np.float32)