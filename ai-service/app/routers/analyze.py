import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pipeline import run_pipeline, run_pipeline_image
from app.schemas import AnalyzeResult

router = APIRouter()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}


@router.post("", response_model=AnalyzeResult)
async def analyze_media(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1].lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        if suffix in IMAGE_EXTENSIONS:
            result = run_pipeline_image(tmp_path)
        elif suffix in VIDEO_EXTENSIONS:
            result = run_pipeline(tmp_path)
        else:
            raise HTTPException(status_code=400, detail=f"Dinh dang file khong ho tro: {suffix}")

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)