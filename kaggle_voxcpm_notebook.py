# ============================================================
# 🎙️ VOXORA — Kaggle Notebook Script
# ============================================================
# Copy TỪNG CELL vào Kaggle Notebook (GPU T4 x2 hoặc P100)
# Mỗi section "# === CELL X ===" là 1 cell riêng biệt
# ============================================================


# === CELL 1: Cài đặt dependencies ===
# Chạy cell này đầu tiên, chờ khoảng 2-3 phút

!pip install -q voxcpm gradio cloudflared 2>/dev/null || true

# Nếu voxcpm không cài được qua pip, clone repo:
import os
if not os.path.exists("/kaggle/working/VoxCPM"):
    !git clone https://github.com/openbmb/VoxCPM.git /kaggle/working/VoxCPM
    !cd /kaggle/working/VoxCPM && pip install -e . -q

# Cài cloudflared
!wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
!chmod +x /usr/local/bin/cloudflared

print("✅ Dependencies installed!")


# === CELL 2: Kiểm tra GPU ===

import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
else:
    print("⚠️ KHÔNG CÓ GPU! Hãy bật GPU trong Kaggle Settings")


# === CELL 3: Chạy VoxCPM + Cloudflare Tunnel ===
# Cell này sẽ chạy liên tục — KHÔNG DỪNG

import subprocess
import threading
import time
import re
import os
import sys

# --- Config ---
VOXCPM_PORT = 8808
MODEL_ID = "openbmb/VoxCPM2"  # Hoặc path local nếu đã download

# ============================================
# BƯỚC 1: Khởi động VoxCPM Gradio Server
# ============================================
print("🚀 Đang khởi động VoxCPM Gradio server...")
print(f"   Model: {MODEL_ID}")
print(f"   Port:  {VOXCPM_PORT}")
print()

# Tìm đường dẫn app.py
app_path = None
for candidate in [
    "/kaggle/working/VoxCPM/app.py",
    "/kaggle/working/app.py",
    os.path.join(os.getcwd(), "app.py"),
]:
    if os.path.exists(candidate):
        app_path = candidate
        break

if app_path is None:
    print("❌ Không tìm thấy app.py! Hãy clone VoxCPM repo trước.")
    sys.exit(1)

app_dir = os.path.dirname(app_path)

# Chạy Gradio server trong background thread
def run_gradio():
    """Run VoxCPM Gradio server in background."""
    env = os.environ.copy()
    env["GRADIO_SERVER_NAME"] = "0.0.0.0"
    env["GRADIO_SERVER_PORT"] = str(VOXCPM_PORT)
    
    proc = subprocess.Popen(
        [sys.executable, app_path, "--model-id", MODEL_ID, "--port", str(VOXCPM_PORT)],
        cwd=app_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env,
        bufsize=1,
    )
    
    for line in iter(proc.stdout.readline, ''):
        line = line.strip()
        if line:
            print(f"[VoxCPM] {line}")

gradio_thread = threading.Thread(target=run_gradio, daemon=True)
gradio_thread.start()

# Chờ Gradio khởi động
print("⏳ Chờ Gradio server khởi động (có thể mất 1-3 phút load model)...")
import urllib.request

for i in range(180):  # Chờ tối đa 3 phút
    time.sleep(2)
    try:
        req = urllib.request.urlopen(f"http://localhost:{VOXCPM_PORT}/config")
        if req.status == 200:
            print(f"✅ Gradio server đã sẵn sàng trên port {VOXCPM_PORT}!")
            break
    except:
        if i % 15 == 0:
            print(f"   ... đang load model ({i*2}s)...")
        continue
else:
    print("⚠️ Gradio chưa sẵn sàng sau 3 phút. Kiểm tra log ở trên.")

# ============================================
# BƯỚC 2: Tạo Cloudflare Tunnel (HTTP)
# ============================================
print()
print("🔗 Đang tạo Cloudflare Tunnel cho Gradio API...")

# Chờ 1 giây để tránh "Text file busy"
time.sleep(1)

tunnel_proc = subprocess.Popen(
    ["/usr/local/bin/cloudflared", "tunnel", "--url", f"http://localhost:{VOXCPM_PORT}"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
)

# Đọc stderr để tìm tunnel URL
tunnel_url = None
for line in tunnel_proc.stderr:
    if "trycloudflare.com" in line:
        match = re.search(r'https://[\w-]+\.trycloudflare\.com', line)
        if match:
            tunnel_url = match.group()
            break

if tunnel_url:
    print()
    print("=" * 60)
    print("🎉 VOXCPM GRADIO API ĐANG CHẠY!")
    print("=" * 60)
    print()
    print(f"  📡 TUNNEL URL: {tunnel_url}")
    print()
    print("  Sử dụng URL này trong file backend/.env:")
    print(f"  VOXCPM_GRADIO_URL={tunnel_url}")
    print()
    print("  Test API:")
    print(f"  curl {tunnel_url}/config")
    print()
    print("=" * 60)
    print()
    print("⚠️  ĐỪNG DỪNG CELL NÀY! Tunnel sẽ mất khi dừng.")
    print("    Để lấy URL mới, chạy lại cell này.")
    print()
else:
    print("❌ Không thể tạo tunnel. Kiểm tra cloudflared.")

# Giữ cell chạy liên tục
print("📊 Server logs:")
try:
    while True:
        time.sleep(60)
        # Health check mỗi phút
        try:
            req = urllib.request.urlopen(f"http://localhost:{VOXCPM_PORT}/config")
            print(f"[Health] ✅ Gradio OK | {time.strftime('%H:%M:%S')}")
        except:
            print(f"[Health] ⚠️ Gradio không phản hồi | {time.strftime('%H:%M:%S')}")
except KeyboardInterrupt:
    print("\n👋 Đã dừng server.")
    tunnel_proc.terminate()
