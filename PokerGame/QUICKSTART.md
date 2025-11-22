# Quick Start Guide

## 🚀 Chạy nhanh ứng dụng Poker

### Bước 1: Chạy Backend

Mở terminal 1:
```bash
cd PokerGame/backend
dotnet restore
cd PokerGame.API
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5000`

### Bước 2: Chạy Frontend

Mở terminal 2:
```bash
cd PokerGame/frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 3: Chơi game

1. Mở browser tại `http://localhost:5173`
2. Click nút "+" trên ghế trống để thêm bot (chọn level: random/basic/smart)
3. Click "Start New Hand" để bắt đầu
4. Chơi poker!

## 📝 Lưu ý

- Đảm bảo backend chạy trước khi mở frontend
- Nếu có lỗi CORS, kiểm tra lại CORS settings trong `Program.cs`
- Game state là in-memory, sẽ reset khi restart backend

## 🎮 Controls

- **Fold**: Bỏ bài
- **Check**: Không cược (khi không có bet)
- **Call**: Theo cược
- **Raise**: Tăng cược (nhập số tiền vào ô input)

## 🤖 Bot Levels

- **random**: Chơi ngẫu nhiên
- **basic**: Logic cơ bản
- **smart**: Logic thông minh với tính toán odds


