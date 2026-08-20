import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_DIR = os.path.join(os.path.dirname(BASE_DIR), "weights")

COUNT_MODEL_PATH = os.path.join(WEIGHTS_DIR, "shrimp_count_yolo.pt")
QUALITY_MODEL_PATH = os.path.join(WEIGHTS_DIR, "shrimp_quality.pt")

YOLO_CONF_THRESHOLD = 0.35
FRAME_SAMPLE_INTERVAL_SEC = 1.0
MAX_FRAMES_TO_PROCESS = 30

QUALITY_INPUT_SIZE = 224
QUALITY_LABELS = ["khong tuoi", "tuoi"]