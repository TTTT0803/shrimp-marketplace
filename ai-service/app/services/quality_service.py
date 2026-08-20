import torch
import torch.nn as nn
import cv2
import numpy as np
from torchvision.models import efficientnet_b0
from app.config import QUALITY_MODEL_PATH, QUALITY_INPUT_SIZE, QUALITY_LABELS

_model = None

_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

NUM_CLASSES = len(QUALITY_LABELS)  # = 2, khop voi classifier.1.weight [2, 1280]


def get_quality_model():
    global _model
    if _model is None:
        print(f"[Quality] Loading EfficientNet-B0 state_dict: {QUALITY_MODEL_PATH}")

        # Khoi tao dung kien truc EfficientNet-B0, khong dung pretrained weights mac dinh
        model = efficientnet_b0(weights=None)

        # Sua lai lop classifier cuoi cho dung 2 class (theo state_dict: classifier.1 -> [2, 1280])
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, NUM_CLASSES)

        # Load trong so da train vao
        state_dict = torch.load(QUALITY_MODEL_PATH, map_location="cpu", weights_only=False)
        model.load_state_dict(state_dict)

        model.eval()
        _model = model

    return _model


def _preprocess(crop_bgr):
    img = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (QUALITY_INPUT_SIZE, QUALITY_INPUT_SIZE))
    img = img.astype(np.float32) / 255.0
    img = (img - _MEAN) / _STD
    img = img.transpose(2, 0, 1)
    img = np.expand_dims(img, axis=0).astype(np.float32)
    return torch.from_numpy(img)


def _softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


def classify_quality(crop_bgr):
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