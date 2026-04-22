<![CDATA[# 🎙️ Voxora AI — Your Voice, Engineered.

<div align="center">

**Nền tảng tạo giọng nói AI cao cấp bằng mô hình VoxCPM (2 tỷ tham số)**

[Demo trực tiếp](https://voxora-1.vercel.app) · [Báo lỗi](https://github.com/khanhkhmt/Voxora_1/issues)

</div>

---

## 📖 Mục lục

1. [Giới thiệu](#-giới-thiệu)
2. [Tính năng](#-tính-năng)
3. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
4. [Yêu cầu trước khi bắt đầu](#-yêu-cầu-trước-khi-bắt-đầu)
5. [Hướng dẫn cài đặt (Từng bước)](#-hướng-dẫn-cài-đặt-từng-bước)
   - [Bước 1: Tạo tài khoản dịch vụ](#bước-1-tạo-tài-khoản-trên-các-dịch-vụ-miễn-phí)
   - [Bước 2: Cấu hình Supabase](#bước-2-cấu-hình-supabase-database--đăng-nhập)
   - [Bước 3: Cấu hình Google OAuth](#bước-3-cấu-hình-đăng-nhập-bằng-google)
   - [Bước 4: Deploy Frontend lên Vercel](#bước-4-deploy-frontend-lên-vercel)
   - [Bước 5: Deploy Backend lên Render](#bước-5-deploy-backend-lên-render)
   - [Bước 6: Khởi chạy AI trên Kaggle](#bước-6-khởi-chạy-ai-engine-trên-kaggle-gpu-miễn-phí)
6. [Chạy trên Server GPU riêng](#-chạy-trên-server-gpu-riêng-nâng-cao)
7. [Cấu trúc dự án](#-cấu-trúc-dự-án)
8. [Xử lý sự cố](#-xử-lý-sự-cố-thường-gặp)
9. [Giấy phép](#-giấy-phép)

---

## 🌟 Giới thiệu

**Voxora** là nền tảng Text-to-Speech (TTS) sử dụng mô hình AI VoxCPM với 2 tỷ tham số, cho phép:

- Tạo giọng nói tự nhiên từ văn bản
- Thiết kế giọng nói mới hoàn toàn
- Clone giọng nói từ file ghi âm

Hệ thống được thiết kế theo kiến trúc **Microservices**: Frontend, Backend, và AI Engine hoạt động tách biệt, có thể chạy trên các máy/dịch vụ khác nhau.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🎨 **Voice Design** | Tạo giọng nói mới chỉ bằng mô tả văn bản (VD: *"Giọng nữ trẻ, nhẹ nhàng, tốc độ chậm"*) |
| 🔄 **Voice Cloning** | Clone giọng nói từ file Audio mẫu, điều khiển được cảm xúc và tốc độ |
| 🎯 **Zero-shot Cloning** | Nhái giọng siêu chính xác bằng kỹ thuật prompt continuation |
| 🌐 **30+ ngôn ngữ** | Hỗ trợ tiếng Việt, Anh, Trung, Nhật, Hàn và nhiều ngôn ngữ khác |
| 🔐 **Đăng nhập Google** | Đăng nhập nhanh bằng tài khoản Google, không cần tạo mật khẩu |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────────────┐
│   Frontend   │────▶│    Backend      │────▶│     AI Engine (GPU)      │
│   (Vercel)   │◀────│    (Render)     │◀────│   (Kaggle / GPU Server)  │
│              │     │                 │     │                          │
│  Next.js     │     │  FastAPI        │     │  VoxCPM Model            │
│  React       │     │  JWT Auth       │     │  Gradio API              │
│  TailwindCSS │     │                 │     │  Cloudflare Tunnel       │
└──────┬───────┘     └────────┬────────┘     └──────────────────────────┘
       │                      │
       └──────────┬───────────┘
                  │
          ┌───────▼───────┐
          │   Supabase    │
          │  (Database +  │
          │   Auth/Login) │
          └───────────────┘
```

**Giải thích đơn giản:**
- **Frontend** = Giao diện web mà người dùng nhìn thấy.
- **Backend** = Máy chủ trung gian, xử lý logic và bảo mật.
- **AI Engine** = Nơi mô hình AI chạy (cần GPU mạnh).
- **Supabase** = Nơi lưu trữ dữ liệu người dùng và xử lý đăng nhập.

---

## 📋 Yêu cầu trước khi bắt đầu

Bạn cần tạo tài khoản **miễn phí** trên các dịch vụ sau (chỉ cần email Gmail):

| Dịch vụ | Dùng để làm gì | Link đăng ký |
|---|---|---|
| **GitHub** | Lưu trữ mã nguồn | [github.com](https://github.com) |
| **Supabase** | Database + Đăng nhập | [supabase.com](https://supabase.com) |
| **Google Cloud** | Cấu hình đăng nhập Google | [console.cloud.google.com](https://console.cloud.google.com) |
| **Vercel** | Chạy giao diện web | [vercel.com](https://vercel.com) |
| **Render** | Chạy máy chủ Backend | [render.com](https://render.com) |
| **Kaggle** | Chạy AI miễn phí trên GPU | [kaggle.com](https://kaggle.com) |

> ⏱️ **Thời gian ước tính:** 30-45 phút cho lần đầu tiên.

---

## 🚀 Hướng dẫn cài đặt (Từng bước)

### Bước 1: Tạo tài khoản trên các dịch vụ miễn phí

1. Đăng ký tài khoản trên **tất cả 6 dịch vụ** ở bảng trên (dùng chung 1 email Gmail cho tiện).
2. **Fork repo này** về GitHub của bạn:
   - Vào trang repo gốc: `https://github.com/khanhkhmt/Voxora_1`
   - Bấm nút **Fork** (góc trên bên phải) → chọn **Create fork**
   - Bây giờ bạn có bản copy ở `https://github.com/<tên-bạn>/Voxora_1`

---

### Bước 2: Cấu hình Supabase (Database + Đăng nhập)

Supabase sẽ quản lý người dùng, đăng nhập, và lưu trữ dữ liệu.

#### 2.1. Tạo project mới
1. Vào [app.supabase.com](https://app.supabase.com) → bấm **New Project**
2. Điền thông tin:
   - **Name:** `voxora` (hoặc tên bạn muốn)
   - **Database Password:** đặt mật khẩu bất kỳ (ghi nhớ lại)
   - **Region:** chọn `Southeast Asia (Singapore)` để nhanh nhất
3. Bấm **Create new project** → đợi 1-2 phút để tạo xong.

#### 2.2. Lấy các mã quan trọng (Keys)
1. Vào **Project Settings** (biểu tượng bánh răng ⚙️ ở thanh bên trái)
2. Chọn **API** ở menu con
3. Bạn sẽ thấy 3 thông tin quan trọng — **copy hết ra file Notepad** để dùng sau:

| Tên | Tìm ở đâu | Ghi chú |
|---|---|---|
| **Project URL** | Mục `URL` | VD: `https://xxxxx.supabase.co` |
| **anon public key** | Mục `Project API keys` → `anon` `public` | Dài, bắt đầu bằng `eyJ...` |
| **service_role key** | Mục `Project API keys` → `service_role` `secret` | ⚠️ **BÍ MẬT** - không chia sẻ! |

4. Tiếp tục kéo xuống hoặc vào **Settings → API → JWT Settings**, copy **JWT Secret**.

#### 2.3. Tạo bảng Profiles
1. Vào **SQL Editor** (biểu tượng ở thanh bên trái)
2. Dán đoạn SQL sau rồi bấm **Run**:

```sql
-- Tạo bảng lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cho phép Backend đọc/ghi bảng này
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

3. Nếu thấy chữ **"Success"** là xong ✅

---

### Bước 3: Cấu hình đăng nhập bằng Google

Để người dùng đăng nhập bằng Gmail, bạn cần cấu hình **2 nơi**: Google Cloud Console và Supabase.

#### 3.1. Tạo OAuth trên Google Cloud Console
1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Tạo project mới (hoặc chọn project có sẵn):
   - Bấm dropdown project ở trên cùng → **New Project** → đặt tên `Voxora` → **Create**
3. Vào **APIs & Services → OAuth consent screen**:
   - Chọn **External** → bấm **Create**
   - Điền tên app: `Voxora`
   - Điền email hỗ trợ: email của bạn
   - Kéo xuống dưới, điền email developer contact: email của bạn
   - Bấm **Save and Continue** → bấm **Save and Continue** → bấm **Save and Continue** → **Back to Dashboard**
4. Vào **APIs & Services → Credentials**:
   - Bấm **+ CREATE CREDENTIALS** → chọn **OAuth client ID**
   - Application type: **Web application**
   - Name: `Voxora Web`
   - **Authorized redirect URIs** → bấm **+ ADD URI** → dán:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
     > ⚠️ Thay `xxxxx` bằng **Project URL** của Supabase bạn (chỉ lấy phần domain, VD: `vxgblddcovsfzyywjmxv`)
   - Bấm **Create**
5. Một popup hiện ra với **Client ID** và **Client Secret** → **copy cả 2 ra Notepad**

#### 3.2. Kết nối Google OAuth với Supabase
1. Quay lại **Supabase Dashboard** → **Authentication** (thanh bên trái) → **Sign In / Providers**
2. Tìm **Google** → bật **Enable Sign in with Google**
3. Dán **Client ID** và **Client Secret** từ bước 3.1 vào
4. Bấm **Save**

---

### Bước 4: Deploy Frontend lên Vercel

#### 4.1. Import project
1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng GitHub
2. Bấm **Add New → Project**
3. Chọn **Import** repo `Voxora_1` từ danh sách GitHub
4. Cấu hình:
   - **Framework Preset:** `Next.js` (tự động nhận diện)
   - **Root Directory:** bấm **Edit** → gõ `frontend` → bấm **Continue**

#### 4.2. Thêm biến môi trường (Environment Variables)
Ở phần **Environment Variables**, thêm lần lượt các biến sau (bấm **Add** sau mỗi cặp):

| Name (KEY) | Value (VALUE) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` *(URL Supabase của bạn)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` *(anon key của Supabase)* |
| `NEXT_PUBLIC_API_URL` | *(để trống, sau deploy Backend sẽ điền)* |

5. Bấm **Deploy** → đợi 1-2 phút
6. Khi xong, Vercel cho bạn một link, VD: `https://voxora-xxx.vercel.app` → **copy lại link này**

#### 4.3. Cập nhật Redirect URL ở Supabase
1. Quay lại **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Ở mục **Site URL**, điền: `https://voxora-xxx.vercel.app` *(link Vercel của bạn)*
3. Ở mục **Redirect URLs**, bấm **Add URL**, thêm:
   ```
   https://voxora-xxx.vercel.app/auth/callback
   ```
4. Bấm **Save**

---

### Bước 5: Deploy Backend lên Render

#### 5.1. Tạo Web Service
1. Vào [render.com](https://render.com) → đăng nhập
2. Bấm **New → Web Service**
3. Kết nối GitHub → chọn repo `Voxora_1`
4. Cấu hình:
   - **Name:** `voxora-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 5.2. Thêm biến môi trường
Vào tab **Environment** → thêm lần lượt:

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | *(anon key)* |
| `SUPABASE_SERVICE_KEY` | *(service_role key — **bí mật**)* |
| `SUPABASE_JWT_SECRET` | *(JWT Secret từ Supabase)* |
| `VOXCPM_GRADIO_URL` | *(để trống, sau chạy Kaggle sẽ điền)* |
| `FRONTEND_URL` | `https://voxora-xxx.vercel.app` |
| `ALLOWED_ORIGINS` | `https://voxora-xxx.vercel.app,http://localhost:3000` |

5. Bấm **Create Web Service** → đợi deploy
6. Khi xong, Render cho bạn link, VD: `https://voxora-backend.onrender.com`

#### 5.3. Cập nhật link Backend cho Frontend
1. Quay lại **Vercel** → vào project → **Settings → Environment Variables**
2. Sửa biến `NEXT_PUBLIC_API_URL` thành: `https://voxora-backend.onrender.com`
3. Vào tab **Deployments** → bấm **⋯** ở deployment mới nhất → **Redeploy**

---

### Bước 6: Khởi chạy AI Engine trên Kaggle (GPU miễn phí)

Đây là bước cuối cùng — chạy mô hình AI trên GPU Kaggle.

#### 6.1. Tạo Notebook
1. Vào [kaggle.com](https://kaggle.com) → **Code** → **+ New Notebook**
2. Ở thanh bên phải:
   - **Accelerator:** chọn **GPU T4 x2** (hoặc **P100**)
   - **Internet:** bật **On**
   - **Persistence:** chọn **Variables and Files**

#### 6.2. Chạy script
1. Mở file `kaggle_voxcpm_notebook.py` trong repo
2. Copy **CELL 1** vào ô code đầu tiên trên Kaggle → bấm ▶️ **Run** → đợi 2-3 phút
3. Copy **CELL 2** vào ô code tiếp theo → bấm ▶️ **Run** → kiểm tra GPU đã bật
4. Copy **CELL 3** vào ô code tiếp theo → bấm ▶️ **Run** → đợi 1-3 phút load model

#### 6.3. Lấy Tunnel URL
- Khi Cell 3 chạy xong, bạn sẽ thấy dòng:
  ```
  📡 TUNNEL URL: https://abc-xyz-123.trycloudflare.com
  ```
- **Copy link này**

#### 6.4. Cập nhật Backend
1. Vào **Render** → project `voxora-backend` → **Environment**
2. Sửa biến `VOXCPM_GRADIO_URL` thành link tunnel vừa copy
3. Bấm **Save Changes** → Render sẽ tự deploy lại

✅ **Xong! Truy cập link Vercel của bạn để sử dụng Voxora.**

---

## 🖥️ Chạy trên Server GPU riêng (Nâng cao)

Nếu bạn có server GPU riêng (≥ 16GB VRAM, khuyến nghị 32GB), bạn có thể bỏ Kaggle + Cloudflare Tunnel:

```bash
# SSH vào server GPU
ssh user@your-server-ip

# Chạy script setup tự động
wget https://raw.githubusercontent.com/khanhkhmt/Voxora_1/main/gpu_server_setup.sh
chmod +x gpu_server_setup.sh
./gpu_server_setup.sh

# Khởi động AI Engine
./start_ai_engine.sh
```

Sau đó sửa biến `VOXCPM_GRADIO_URL` trên Render thành:
```
http://<IP-server-GPU>:8808
```

> **Ưu điểm:** Chạy 24/7 ổn định, không bị ngắt session như Kaggle, tốc độ nhanh hơn nhiều.

---

## 📂 Cấu trúc dự án

```
Voxora_1/
├── 📁 frontend/                  # Giao diện web (Next.js + TailwindCSS)
│   ├── app/                      #   Các trang: login, register, studio, admin
│   ├── components/               #   Các thành phần UI tái sử dụng
│   ├── lib/                      #   Kết nối Supabase
│   └── package.json
│
├── 📁 backend/                   # Máy chủ API (FastAPI + Python)
│   ├── main.py                   #   Entry point — khởi động server
│   ├── auth.py                   #   Xác thực JWT & quản lý user
│   ├── tts_service.py            #   Giao tiếp với AI Engine (Gradio)
│   ├── config.py                 #   Đọc biến môi trường (.env)
│   ├── requirements.txt          #   Danh sách thư viện Python
│   └── Dockerfile                #   Docker (cho Render)
│
├── 📁 src/voxcpm/                # Mã nguồn lõi AI — VoxCPM Model
├── 📁 conf/                      # Cấu hình mô hình AI
├── 📁 examples/                  # Audio mẫu để test
│
├── 📄 kaggle_voxcpm_notebook.py  # Script 1-click chạy AI trên Kaggle
├── 📄 gpu_server_setup.sh        # Script setup server GPU riêng
├── 📄 app.py                     # Gradio UI gốc của VoxCPM
├── 📄 voxora_landing.html        # Landing page tĩnh
└── 📄 README.md                  # File hướng dẫn này
```

---

## 🔧 Xử lý sự cố thường gặp

### ❌ Đăng nhập Google lỗi "Unable to exchange external code"
**Nguyên nhân:** Chưa thêm Redirect URI vào Google Cloud Console.
**Cách sửa:** Vào Google Cloud Console → APIs & Services → Credentials → OAuth Client → thêm URI:
```
https://xxxxx.supabase.co/auth/v1/callback
```

### ❌ Đăng nhập xong quay lại trang Login
**Nguyên nhân:** Redirect URL chưa đúng ở Supabase.
**Cách sửa:** Supabase → Authentication → URL Configuration → thêm:
```
https://your-vercel-domain.vercel.app/auth/callback
```

### ❌ Trang web trắng / lỗi 500
**Nguyên nhân:** Thiếu biến môi trường trên Vercel.
**Cách sửa:** Kiểm tra lại `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` trên Vercel.

### ❌ Kaggle session bị ngắt
**Nguyên nhân:** Kaggle miễn phí chỉ cho chạy tối đa 12 giờ.
**Cách sửa:** Chạy lại Cell 3 để lấy Tunnel URL mới, cập nhật lại trên Render.

### ❌ Backend Render bị "ngủ" (mất 30s mới phản hồi)
**Nguyên nhân:** Render miễn phí tắt server sau 15 phút không có request.
**Cách sửa:** Nâng cấp Render lên bản trả phí, hoặc dùng [UptimeRobot](https://uptimerobot.com) để ping mỗi 5 phút.

---

## 📄 Giấy phép

Dự án sử dụng giấy phép [Apache License 2.0](LICENSE). Mô hình VoxCPM thuộc bản quyền của [OpenBMB](https://github.com/openbmb).

---

<div align="center">

**Made with ❤️ by [KhanhKHMT](https://github.com/khanhkhmt)**

</div>
]]>
