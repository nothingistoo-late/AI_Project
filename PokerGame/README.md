# Texas Hold'em Poker Game

Ứng dụng Texas Hold'em Poker fullstack với ASP.NET Core Web API backend và React frontend.

## 🏗️ Công nghệ

- **Backend**: ASP.NET Core Web API (.NET 8)
- **Frontend**: ReactJS + Vite + Tailwind CSS + Framer Motion
- **State Management**: In-memory (không cần database)

## 📁 Cấu trúc Project

```
PokerGame/
├── backend/
│   ├── PokerGame.API/          # Web API Controllers
│   ├── PokerGame.Business/     # Business Logic (Game, Bot, Hand Evaluation)
│   └── PokerGame.Domain/       # Domain Entities (Card, Player, GameState)
└── frontend/                   # React Application
```

## 🚀 Cách chạy

### Backend

1. Mở terminal trong thư mục `PokerGame/backend`
2. Restore packages và build:
   ```bash
   dotnet restore
   dotnet build
   ```
3. Chạy API:
   ```bash
   cd PokerGame.API
   dotnet run
   ```
   API sẽ chạy tại `http://localhost:5000`

### Frontend

1. Mở terminal trong thư mục `PokerGame/frontend`
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy development server:
   ```bash
   npm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:5173`

## 🎮 Cách chơi

1. **Khởi tạo game**: Game tự động tạo và thêm bạn vào seat 0
2. **Thêm bot**: Click nút "+" trên ghế trống để thêm bot (chọn level: random/basic/smart)
3. **Bắt đầu hand**: Click "Start New Hand" để bắt đầu ván mới
4. **Chơi**: 
   - Khi đến lượt bạn, chọn action: Fold, Check/Call, hoặc Raise
   - Bot sẽ tự động chơi khi đến lượt
5. **Xem bài bot**: Toggle checkbox "Show Bot Cards" để xem bài của bot
6. **Showdown**: Khi hand kết thúc, bài sẽ được hiển thị và winner được highlight

## 🤖 Bot Levels

- **Easy**: Logic đơn giản với một số randomness, fold bad hands, raise strong hands
- **Medium**: Sử dụng hand strength + pot odds + equity để quyết định
- **Hard**: Logic nâng cao với:
  - Positional awareness (early/late position)
  - Board texture analysis (dry/flushy/straighty/paired)
  - Bluff frequency calculation
  - Semi-bluff với draws
  - Implied odds consideration
  - Optimal bet sizing

## 📊 Tính năng

### Game Logic
- ✅ 4-seat poker table
- ✅ Dealer rotation
- ✅ Small/Big blinds
- ✅ Betting rounds (Pre-flop, Flop, Turn, River)
- ✅ Hand evaluation (Pair, Flush, Straight, etc.)
- ✅ Winner evaluation và showdown

### Bot Logic
- ✅ Hand strength calculation
- ✅ Pot odds calculation
- ✅ Outs calculation
- ✅ Win probability (Monte Carlo simulation)
- ✅ Equity calculation
- ✅ Multiple bot difficulty levels

### UI Features
- ✅ Oval poker table design với green felt texture
- ✅ Card animations (dealing, flipping) với Framer Motion
- ✅ Chip stack animations khi betting
- ✅ Dealer button animation
- ✅ Player avatars và info với Lucide icons
- ✅ Winner overlay với confetti effect
- ✅ Toggle để xem bài bot
- ✅ Hand ranking display
- ✅ Game log panel (last 5 actions)
- ✅ Smooth transitions và hover effects

## 🔌 API Endpoints

### Game Management
- `GET /api/game/state` - Lấy trạng thái game hiện tại
- `POST /api/game/start` - Tạo game mới (thay thế create)
- `POST /api/game/player` - Thêm player
- `POST /api/game/add-bot` - Thêm bot với level (Easy/Medium/Hard)
- `DELETE /api/game/player/{seatNumber}` - Xóa player
- `POST /api/game/hand/start` - Bắt đầu hand mới
- `POST /api/game/action` - Player action (fold/check/call/raise)
- `POST /api/game/bots/process` - Xử lý lượt bot
- `POST /api/game/evaluate` - Đánh giá winners
- `POST /api/game/reset` - Reset game
- `POST /api/game/next-stage` - Advance to next betting round (auto-triggered)
- `GET /api/game/toggle-bot-cards` - Toggle bot card visibility (dev feature)

### Odds Calculation
- `POST /api/odds/outs` - Tính số outs
- `POST /api/odds/winrate` - Tính win rate
- `POST /api/odds/potodds` - Tính pot odds
- `POST /api/odds/equity` - Tính equity

## 🎯 Hand Rankings

1. Royal Flush
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. Pair
10. High Card

## 🔧 Development

### Backend Structure
- **Domain**: Entities (Card, Player, GameState, HandRank)
- **Business**: Services (GameService, BotService, HandEvaluator, OddsCalculator)
- **API**: Controllers và DTOs

### Frontend Structure
- **Components**: PokerTable, PlayerSeat, Card, GameControls, PlayerInfo
- **Services**: API client
- **Styling**: Tailwind CSS với custom poker theme

## 📝 Notes

- Game state được lưu in-memory, sẽ reset khi restart server
- Có thể mở rộng để lưu history vào database sau này
- Bot logic có thể được cải thiện thêm với ML hoặc advanced algorithms
- UI có thể được enhance thêm với sound effects và more animations

## 🐛 Troubleshooting

- Nếu API không chạy, kiểm tra port 5000 có bị chiếm không
- Nếu frontend không kết nối được API, kiểm tra proxy trong `vite.config.js`
- Nếu có lỗi CORS, đảm bảo backend đã enable CORS cho frontend origin

## 📄 License

MIT

