from app.services.count_service import get_count_model

model = get_count_model()
print("Model đếm tôm load thành công!")
print("Danh sách class:", model.names)