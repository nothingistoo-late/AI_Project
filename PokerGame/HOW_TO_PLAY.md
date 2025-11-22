# Hướng Dẫn Chơi Texas Hold'em Poker

## 🎮 Bắt Đầu Game

### Bước 1: Khởi động ứng dụng
1. **Backend**: Chạy `dotnet run` trong thư mục `PokerGame/backend/PokerGame.API`
2. **Frontend**: Chạy `npm run dev` trong thư mục `PokerGame/frontend`
3. Mở browser tại `http://localhost:5173`

### Bước 2: Setup Game
- Game sẽ tự động tạo và thêm bạn vào **Seat 0** (ghế dưới cùng)
- Bạn sẽ có **$1000 chips** ban đầu

### Bước 3: Thêm Bot (Tùy chọn)
- Click nút **"+"** trên các ghế trống
- Chọn bot level:
  - **Easy**: Bot dễ, logic đơn giản
  - **Medium**: Bot trung bình, có tính toán odds
  - **Hard**: Bot khó, có bluffing và positional play
- Cần ít nhất **2 người chơi** để bắt đầu

### Bước 4: Bắt Đầu Hand
- Click nút **"Start New Hand"** (màu xanh lá, có icon Play)
- Game sẽ:
  - Chia bài cho tất cả người chơi (2 lá mỗi người)
  - Đặt dealer button
  - Post small blind ($10) và big blind ($20)
  - Bắt đầu betting round

## 🎯 Cách Chơi

### Các Hành Động (Actions)

1. **Fold** (Bỏ bài) - Màu đỏ, icon X
   - Bỏ bài, không tham gia ván này nữa
   - Mất số tiền đã bet

2. **Check** (Không cược) - Màu xanh, icon ✓
   - Chỉ có thể check khi không có ai bet
   - Giữ nguyên bài, chờ vòng tiếp theo

3. **Call** (Theo cược) - Màu vàng, icon $
   - Theo số tiền người trước đã bet
   - Hiển thị số tiền cần call

4. **Raise** (Tăng cược) - Màu tím, icon ↑
   - Nhập số tiền muốn raise vào ô input
   - Minimum raise = Current Bet + Last Raise Amount (hoặc Big Blind)
   - Maximum = Số chips bạn có

### Các Giai Đoạn (Phases)

1. **Pre-Flop**: Sau khi chia bài, trước khi lật community cards
2. **Flop**: Lật 3 lá bài chung đầu tiên
3. **Turn**: Lật lá bài chung thứ 4
4. **River**: Lật lá bài chung cuối cùng (lá thứ 5)
5. **Showdown**: So bài, xác định người thắng

### Luật Chơi

- **Small Blind**: $10 (người sau dealer)
- **Big Blind**: $20 (người sau small blind)
- **Minimum Raise**: Ít nhất phải tăng gấp đôi big blind hoặc raise trước đó
- **All-In**: Khi hết chips, tự động all-in
- **Showdown**: Khi đến River và còn nhiều hơn 1 người chơi, sẽ so bài

## 💡 Mẹo Chơi

1. **Quan sát**: Xem bot chơi như thế nào, học từ chúng
2. **Position**: Vị trí sau dealer có lợi thế (có thể xem người khác hành động trước)
3. **Pot Odds**: Tính toán xem có đáng call không
4. **Bluffing**: Đôi khi cần bluff để thắng pot lớn
5. **Patience**: Đừng chơi mọi hand, chờ bài tốt

## 🎨 Tính Năng UI

- **Show Bot Cards**: Toggle để xem bài của bot (để học)
- **Game Log**: Xem 5 hành động gần nhất
- **Player Info**: Xem thông tin chi tiết về game
- **Winner Overlay**: Hiển thị người thắng với animation

## ⚠️ Lưu Ý

- Game state là in-memory, sẽ reset khi restart backend
- Cần ít nhất 2 người chơi để bắt đầu hand
- Không thể undo sau khi đã action
- Bot sẽ tự động chơi khi đến lượt

## 🐛 Troubleshooting

- Nếu không thấy nút "Start New Hand": Kiểm tra xem phase có phải "Waiting" không
- Nếu bot không chơi: Refresh page hoặc check console
- Nếu lỗi API: Đảm bảo backend đang chạy tại port 5000

Chúc bạn chơi vui vẻ! 🎰


