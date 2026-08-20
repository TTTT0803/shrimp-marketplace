import torch

state_dict = torch.load("weights/shrimp_quality.pt", map_location="cpu", weights_only=False)

print("Tổng số layer:", len(state_dict))

print("\n--- 15 layer CUỐI CÙNG ---")
keys = list(state_dict.keys())
for key in keys[-15:]:
    print(key, "->", state_dict[key].shape)

print("\n--- Tìm layer 'classifier' ---")
for key in keys:
    if "classifier" in key:
        print(key, "->", state_dict[key].shape)