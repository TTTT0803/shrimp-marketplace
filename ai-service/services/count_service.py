import cv2
from ultralytics import YOLO
from app.config import (
    COUNT_MODEL_PATH,
    YOLO_CONF_THRESHOLD,
    FRAME_SAMPLE_INTERVAL_SEC,
    MAX_FRAMES_TO_PROCESS,
)

_model = None


def get_count_model():
    global _model
    if _model is None:
        print(f"[Count] Loading model: {COUNT_MODEL_PATH}")
        _model = YOLO(COUNT_MODEL_PATH)
    return _model


def extract_frames(video_path: str):
    """
    Lấy mẫu frame từ video theo mỗi FRAME_SAMPLE_INTERVAL_SEC giây.
    Trả về list [(frame_index, frame_bgr), ...]
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Không mở được video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frame_interval = max(1, int(fps * FRAME_SAMPLE_INTERVAL_SEC))

    frames = []
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append((frame_idx, frame))
            if len(frames) >= MAX_FRAMES_TO_PROCESS:
                break
        frame_idx += 1

    cap.release()
    return frames


def detect_shrimp(frame):
    """
    Chạy model đếm tôm trên 1 frame.
    Trả về list: [{"bbox": [x1,y1,x2,y2], "confidence": float}, ...]
    """
    model = get_count_model()
    results = model.predict(source=frame, conf=YOLO_CONF_THRESHOLD, verbose=False)

    detections = []
    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            conf = float(box.conf[0].item())
            detections.append({"bbox": xyxy, "confidence": conf})
    return detections


def crop_box(frame, bbox):
    """Cắt vùng ảnh chứa 1 con tôm từ bbox, để đưa qua model chất lượng."""
    x1, y1, x2, y2 = [int(v) for v in bbox]
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    if x2 <= x1 or y2 <= y1:
        return None
    return frame[y1:y2, x1:x2]