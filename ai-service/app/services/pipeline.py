import time
import cv2
from collections import Counter

from app.services.count_service import extract_frames, detect_shrimp, crop_box
from app.services.quality_service import classify_quality
from app.schemas import AnalyzeResult, ShrimpDetection

MAX_CROPS_FOR_QUALITY = 100


def run_pipeline(video_path: str) -> AnalyzeResult:
    """Dung khi input la video."""
    start_time = time.time()

    frames = extract_frames(video_path)
    if not frames:
        raise ValueError("Khong trich xuat duoc frame nao tu video.")

    return _process_frames(frames, start_time)


def run_pipeline_image(image_path: str) -> AnalyzeResult:
    """Dung khi input la 1 anh tinh (khong phai video)."""
    start_time = time.time()

    frame = cv2.imread(image_path)
    if frame is None:
        raise ValueError(f"Khong doc duoc anh: {image_path}")

    frames = [(0, frame)]
    return _process_frames(frames, start_time)


def _process_frames(frames, start_time) -> AnalyzeResult:
    """Ham dung chung cho ca video va anh - nhan list [(frame_index, frame_bgr), ...]"""
    all_detections = []
    per_frame_counts = []
    crops_processed = 0

    for frame_idx, frame in frames:
        dets = detect_shrimp(frame)
        per_frame_counts.append(len(dets))

        for det in dets:
            bbox = det["bbox"]
            quality_label, quality_confidence = None, None

            if crops_processed < MAX_CROPS_FOR_QUALITY:
                crop = crop_box(frame, bbox)
                if crop is not None and crop.size > 0:
                    quality_label, quality_confidence = classify_quality(crop)
                    crops_processed += 1

            all_detections.append(
                ShrimpDetection(
                    frame_index=frame_idx,
                    bbox=bbox,
                    detection_confidence=round(det["confidence"], 4),
                    quality_label=quality_label,
                    quality_confidence=round(quality_confidence, 4) if quality_confidence else None,
                )
            )

    # So luong tom: tam dung frame co nhieu detection nhat
    # (gioi han hien tai - chua co object tracking de tranh dem trung qua cac frame)
    shrimp_count = max(per_frame_counts) if per_frame_counts else 0

    det_confidences = [d.detection_confidence for d in all_detections]
    avg_confidence = round(sum(det_confidences) / len(det_confidences), 4) if det_confidences else 0.0

    quality_labels = [d.quality_label for d in all_detections if d.quality_label]
    quality_distribution = dict(Counter(quality_labels))
    overall_label = Counter(quality_labels).most_common(1)[0][0] if quality_labels else "Khong xac dinh"

    processing_time = round(time.time() - start_time, 2)

    return AnalyzeResult(
        shrimp_count=shrimp_count,
        confidence=avg_confidence,
        quality_grade=overall_label,
        average_size=0.0,
        processing_time=processing_time,
        ai_result={
            "processed_frames": len(frames),
            "quality_distribution": quality_distribution,
            "detections_sample": [d.dict() for d in all_detections[:20]],
        },
    )