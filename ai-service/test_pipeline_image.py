import cv2
from app.services.count_service import detect_shrimp, crop_box
from app.services.quality_service import classify_quality

IMAGE_PATH = "img.png"  # doi thanh duong dan anh test that cua ban

def test_image(image_path):
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"Khong doc duoc anh: {image_path}")
        return

    print(f"Da doc anh, kich thuoc: {frame.shape}")

    detections = detect_shrimp(frame)
    print(f"\nSo luong phat hien: {len(detections)}")

    for i, det in enumerate(detections):
        bbox = det["bbox"]
        conf = det["confidence"]
        print(f"\n--- Doi tuong {i+1} ---")
        print(f"BBox: {bbox}, Confidence: {conf:.4f}")

        crop = crop_box(frame, bbox)
        if crop is not None and crop.size > 0:
            label, quality_conf = classify_quality(crop)
            print(f"Chat luong: {label} (confidence: {quality_conf:.4f})")
        else:
            print("Khong crop duoc anh")

if __name__ == "__main__":
    test_image(IMAGE_PATH)