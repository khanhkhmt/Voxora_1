# Voxora AI - Your Voice, Engineered.

Voxora là một nền tảng tạo giọng nói AI cao cấp (Text-to-Speech) dựa trên mô hình **VoxCPM (2 Tỷ tham số)**. Dự án được thiết kế theo kiến trúc Microservices hiện đại, tách biệt hoàn toàn Giao diện người dùng (Frontend), Máy chủ API (Backend), và Lõi xử lý AI (GPU Engine).

## 🌟 Tính năng nổi bật
* **Voice Design**: Tạo giọng nói hoàn toàn mới chỉ bằng văn bản mô tả (VD: "A calm young female voice...").
* **Controllable Voice Cloning**: Clone giọng nói từ file Audio mẫu và điểu khiển được cảm xúc, tốc độ.
* **Ultimate Cloning**: Nhái giọng siêu chuẩn xác bằng kỹ thuật Zero-shot prompt continuation.
* **Kiến trúc linh hoạt**: Dễ dàng deploy Backend/Frontend ở máy cá nhân (hoặc Vercel) và cắm AI Engine ở Kaggle hoặc Private GPU Server (RunPod/AWS).

## 📂 Cấu trúc dự án
* `/frontend`: Giao diện Next.js 15 (App Router), TailwindCSS.
* `/backend`: API Gateway bằng FastAPI, xác thực JWT, đóng gói gửi lệnh tới AI.
* `/src/voxcpm`: Lõi mã nguồn AI của VoxCPM.
* `kaggle_voxcpm_notebook.py`: Script tự động hóa 1-click để khởi tạo máy chủ GPU miễn phí trên Kaggle qua Cloudflare Tunnel.
* `gpu_server_setup.sh`: Script dùng để setup nếu bạn thuê server GPU riêng.

## 🚀 Hướng dẫn cài đặt (Local + Kaggle)

### 1. Khởi chạy AI trên Kaggle (Miễn phí GPU)
1. Mở [Kaggle](https://kaggle.com), tạo Notebook mới bật **GPU T4 x2**.
2. Copy toàn bộ nội dung file `kaggle_voxcpm_notebook.py` chạy trên Notebook đó.
3. Lấy `TUNNEL URL` (ví dụ: `https://xxx.trycloudflare.com`) in ra ở màn hình.

### 2. Khởi chạy Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Tạo file `.env` trong thư mục `backend/`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=voxora2026
JWT_SECRET=your-secret-key
VOXCPM_GRADIO_URL=https://<link-cloudflare-kaggle-cua-ban>
```
Chạy Backend: `python main.py` (Chạy ở cổng 8001).

### 3. Khởi chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Truy cập `http://localhost:3000/login` và bắt đầu sử dụng!
