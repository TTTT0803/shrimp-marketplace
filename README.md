# Shrimp Marketplace

Sàn thương mại điện tử B2B cho ngành thủy sản — nơi người nuôi tôm bán trực tiếp cho khách hàng nước ngoài, với mọi lô hàng được xác minh bởi AI (đếm số lượng + kiểm định chất lượng) và Blockchain (lưu bằng chứng + ký quỹ thanh toán).

## Kiến trúc tổng quan

- **MySQL** — lưu toàn bộ dữ liệu hiển thị (tên lô, mô tả, giá, chứng từ...) để website load nhanh
- **IPFS (Pinata)** — lưu video/ảnh gốc bất biến, trả về CID làm bằng chứng chống chỉnh sửa
- **Blockchain (Polygon Amoy testnet)** — lưu trạng thái giao dịch, tiền ký quỹ (escrow), không thể can thiệp
- **AI Service (FastAPI)** — 2 model: đếm số lượng tôm (YOLO) + kiểm định chất lượng (EfficientNet-B0)

```
shrimp-marketplace/
├── backend/        # Node.js + Express + MySQL (Sequelize)
├── ai-service/      # Python FastAPI - 2 model AI (đếm + chất lượng)
├── contracts/       # Hardhat + Solidity smart contracts
└── README.md
```

## Yêu cầu môi trường

- Node.js LTS (v18+)
- Python 3.10+
- XAMPP (MySQL) + HeidiSQL
- MetaMask extension (trình duyệt)
- Tài khoản Pinata (IPFS)
- Tài khoản Alchemy hoặc dùng RPC công khai Polygon Amoy

---

## 1. Cài đặt Backend (Node.js)

```bash
cd backend
npm install
```

Tạo file `backend/.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=shrimp_marketplace

JWT_SECRET=your_own_secret_key

PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

AI_SERVICE_URL=http://localhost:8000
```

Import database:
1. Bật MySQL trong XAMPP Control Panel
2. Mở HeidiSQL → tạo database `shrimp_marketplace`
3. Import file `backend/schema.sql` vào database vừa tạo

Chạy server:
```bash
node server.js
```
Server chạy tại `http://localhost:5000`

Test liên kết ví MetaMask: mở `http://localhost:5000/test-wallet.html`

---

## 2. Cài đặt AI Service (Python)

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Đặt 2 file model vào thư mục `ai-service/weights/`:
```
weights/
├── shrimp_count_yolo.pt      # model đếm số lượng tôm (YOLO)
└── shrimp_quality.pt          # model kiểm định chất lượng (EfficientNet-B0)
```

Chạy server:
```bash
uvicorn main:app --reload --port 8000
```
Server chạy tại `http://localhost:8000`

Test nhanh qua giao diện Swagger có sẵn: `http://localhost:8000/docs`

Endpoint chính:
- `GET /health` — kiểm tra server sống
- `POST /analyze` — gửi file ảnh/video (form-data, key `file`), trả về kết quả phân tích (số lượng, chất lượng, độ tin cậy...)

---

## 3. Cài đặt Smart Contracts (Hardhat)

```bash
cd contracts
npm install
```

Tạo file `contracts/.env`:
```env
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0xyour_private_key_here
```

⚠️ Dùng ví riêng để deploy (không dùng ví cá nhân chứa tài sản thật). Lấy MATIC testnet miễn phí tại: `https://faucet.polygon.technology/` (chọn mạng Amoy).

Deploy contract mẫu (test pipeline):
```bash
npx hardhat ignition deploy ignition/modules/Lock.js --network amoy
```

Xem contract đã deploy tại: `https://amoy.polygonscan.com`

---

## Luồng hoạt động chính (MVP)

1. **Farmer** đăng nhập, liên kết ví MetaMask
2. Farmer tạo lô hàng (`POST /lots`) — trạng thái `DRAFT`
3. Farmer upload video/ảnh thu hoạch (`POST /lots/:lotId/upload`):
   - Backend gọi AI Service phân tích → lưu kết quả vào bảng `ai_analysis`
   - Backend upload file gốc lên IPFS (Pinata) → lưu CID vào bảng `ipfs_metadata`
   - Trạng thái lô chuyển sang `AI_ANALYZED`
4. Farmer ký MetaMask để đăng lô lên Blockchain → trạng thái `LISTED`
5. **Buyer** xem lô hàng, đặt cọc qua Smart Contract (escrow) → trạng thái `LOCKED`
6. Farmer giao hàng, Buyer xác nhận nhận hàng → Smart Contract tự động giải ngân → trạng thái `COMPLETED`
7. Buyer đánh giá (rating + comment)

## Trạng thái phát triển

- [x] Tuần 1 — Nền tảng: Database, Auth, liên kết ví MetaMask, IPFS, Blockchain deploy thử
- [x] Tuần 2 — AI Service: tích hợp model đếm + chất lượng, API tạo lô hàng
- [ ] Tuần 3 — Smart Contract Escrow thật + Marketplace (Buyer)
- [ ] Tuần 4 — Checkout, Admin Dashboard, kiểm thử toàn bộ

## Ghi chú kỹ thuật quan trọng

- Số lượng tôm hiện tính theo frame có nhiều detection nhất (chưa có object tracking) — có thể chưa hoàn toàn chính xác với video dài, cần cải tiến bằng tracking (ByteTrack/DeepSORT) ở giai đoạn sau
- `average_size` (kích cỡ tôm ước tính) hiện chưa được calibrate theo tỷ lệ pixel-to-cm thực tế — cần vật tham chiếu cố định trong khung hình để tính chính xác
- Toàn bộ hệ thống đang chạy trên **testnet** (Polygon Amoy) — chưa triển khai mainnet