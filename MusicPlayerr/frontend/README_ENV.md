# Environment Configuration

## Setup .env File

1. Tạo file `.env` trong thư mục `frontend/`:
   ```bash
   # Windows PowerShell
   New-Item -ItemType File -Path ".env"
   ```

2. Thêm nội dung sau vào file `.env`:
   ```env
   # Backend API URL
   # In development, leave empty to use Vite proxy
   # In production, set to your backend URL (e.g., http://localhost:51815 or https://api.yourdomain.com)
   VITE_API_URL=
   ```

3. Cấu hình:
   - **VITE_API_URL**: Backend API URL
     - Để trống trong development để dùng Vite proxy
     - Đặt URL đầy đủ trong production (ví dụ: `http://localhost:51815` hoặc `https://api.yourdomain.com`)

## Environment Variables

Vite tự động load các biến có prefix `VITE_` từ file `.env`.

Các file có thể dùng:
- `.env` - Loaded trong mọi trường hợp
- `.env.local` - Loaded trong mọi trường hợp, bị git ignore
- `.env.development` - Loaded trong development mode
- `.env.production` - Loaded trong production mode

## Ví dụ

```env
# Development (dùng Vite proxy)
VITE_API_URL=

# Production
VITE_API_URL=http://localhost:51815
# hoặc
VITE_API_URL=https://api.yourdomain.com
```

## Sử dụng trong Code

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Không bao giờ commit file `.env` lên git!**

