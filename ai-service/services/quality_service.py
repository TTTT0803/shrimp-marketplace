import torch
import cv2
import numpy as np
from app.config import QUALITY_MODEL_PATH, QUALITY_INPUT_SIZE, QUALITY_LABELS

_model = None

# Chuẩn hóa theo ImageNet (mặc định khi train bằng torchvision pretrained)
_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def get_quality_model():
    global _model
    if _model is None:
        print(f"[Quality] Loading model: {QUALITY_MODEL_PATH}")
        _model = torch.load(QUALITY_MODEL_PATH, map_location="cpu", weights_only=False)
        _model.eval()
    return _model


def _preprocess(crop_bgr):
    img = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (QUALITY_INPUT_SIZE, QUALITY_INPUT_SIZE))
    img = img.astype(np.float32) / 255.0
    img = (img - _MEAN) / _STD
    img = img.transpose(2, 0, 1)  # HWC -> CHW
    img = np.expand_dims(img, axis=0).astype(np.float32)
    return torch.from_numpy(img)


def _softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


def classify_quality(crop_bgr):
    """
    Nhận 1 ảnh crop (BGR, từ count_service cắt ra), trả về (label, confidence).
    """
    model = get_quality_model()
    input_tensor = _preprocess(crop_bgr)

    with torch.no_grad():
        output = model(input_tensor)
        logits = output[0].numpy()

    probs = _softmax(logits)
    idx = int(np.argmax(probs))
    label = QUALITY_LABELS[idx] if idx < len(QUALITY_LABELS) else f"class_{idx}"
    confidence = float(probs[idx])
    return label, confidence