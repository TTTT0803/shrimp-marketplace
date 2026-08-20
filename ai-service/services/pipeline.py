import time
from collections import Counter

from app.services.count_service import extract_frames, detect_shrimp, crop_box
from app.services.quality_service import classify_quality
from app.schemas import AnalyzeResult, ShrimpDetection

MAX_CROPS_FOR_QUALITY = 100


def run_pipeline(video_path: str) -> AnalyzeResult:
    start_time = time.time()

    frames = extract_frames(video_path)
    if not frames:
        raise ValueError("Không trích xuất được frame nào từ video.")

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

    # Số lượng tôm: tạm dùng frame có nhiều detection nhất
    # (giới hạn hiện tại - chưa có object tracking để tránh đếm trùng qua các frame)
    shrimp_count = max(per_frame_counts) if per_frame_counts else 0

    det_confidences = [d.detection_confidence for d in all_detections]
    avg_confidence = round(sum(det_confidences) / len(det_confidences), 4) if det_confidences else 0.0

    quality_labels = [d.quality_label for d in all_detections if d.quality_label]
    quality_distribution = dict(Counter(quality_labels))
    overall_label = Counter(quality_labels).most_common(1)[0][0] if quality_labels else "Không xác định"

    processing_time = round(time.time() - start_time, 2)

    return AnalyzeResult(
        shrimp_count=shrimp_count,
        confidence=avg_confidence,
        quality_grade=overall_label,
        average_size=0.0,  # chưa calibrate, để 0 tạm
        processing_time=processing_time,
        ai_result={
            "processed_frames": len(frames),
            "quality_distribution": quality_distribution,
            "detections_sample": [d.dict() for d in all_detections[:20]],
        },
    )