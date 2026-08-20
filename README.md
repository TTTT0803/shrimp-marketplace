# Shrimp Marketplace

## Yêu cầu
- Node.js LTS
- XAMPP (MySQL)
- MetaMask extension

## Cài đặt Backend
1. Bật MySQL trong XAMPP Control Panel
2. Import `backend/schema.sql` vào database `shrimp_marketplace` bằng HeidiSQL
3. cd backend && npm install
4. Tạo file .env (xem mẫu bên dưới)
5. node server.js

## .env mẫu cho backend
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=shrimp_marketplace
JWT_SECRET=your_own_secret
PINATA_API_KEY=
PINATA_SECRET_KEY=

## Cài đặt Contracts
1. cd contracts && npm install
2. Tạo file .env với AMOY_RPC_URL và DEPLOYER_PRIVATE_KEY
3. Deploy: npx hardhat ignition deploy ignition/modules/Lock.js --network amoy

## Test wallet linking
Mở http://localhost:5000/test-wallet.html