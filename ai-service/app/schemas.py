from typing import List, Dict, Optional
from pydantic import BaseModel


class ShrimpDetection(BaseModel):
    frame_index: int
    bbox: List[float]
    detection_confidence: float
    quality_label: Optional[str] = None
    quality_confidence: Optional[float] = None


class AnalyzeResult(BaseModel):
    model_name: str = "yolo-count+quality-classifier"
    model_version: str = "v1.0"
    shrimp_count: int
    confidence: float
    quality_grade: str
    average_size: float
    processing_time: float
    ai_result: Dict


class AnalyzeError(BaseModel):
    error: str
    detail: Optional[str] = None