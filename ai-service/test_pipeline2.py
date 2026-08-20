from app.services.pipeline import run_pipeline_image

result = run_pipeline_image("img.png")  # doi ten file anh test cho dung
print(result.model_dump_json(indent=2))