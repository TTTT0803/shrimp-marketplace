from app.services.quality_service import get_quality_model

model = get_quality_model()
print("Model chất lượng load thành công!")
print(model)