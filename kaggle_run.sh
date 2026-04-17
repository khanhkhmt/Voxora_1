#!/bin/bash
# ============================================
# Script: Chạy lệnh trên Kaggle GPU từ máy local
# Sử dụng: ./kaggle_run.sh "lệnh cần chạy"
# Ví dụ:  ./kaggle_run.sh "nvidia-smi"
#         ./kaggle_run.sh "python3 -c 'import torch; print(torch.cuda.is_available())'"
# ============================================

# === CẤU HÌNH - Cập nhật TUNNEL_URL mỗi khi Kaggle restart ===
TUNNEL_URL="${KAGGLE_TUNNEL:-solving-frequently-connection-harris.trycloudflare.com}"
PASSWORD="kaggle123"
CLOUDFLARED="/tmp/cloudflared"

# Thiết lập biến môi trường GPU
ENV_SETUP="export LD_LIBRARY_PATH=/usr/local/nvidia/lib64:\$LD_LIBRARY_PATH && export PATH=/opt/bin:/usr/local/cuda-12.8/bin:\$PATH"

if [ -z "$1" ]; then
    echo "📌 Cách dùng: ./kaggle_run.sh \"lệnh cần chạy\""
    echo "📌 Ví dụ:    ./kaggle_run.sh \"nvidia-smi\""
    echo ""
    echo "🔧 Đổi tunnel URL: export KAGGLE_TUNNEL=xxx.trycloudflare.com"
    echo "   Tunnel hiện tại: $TUNNEL_URL"
    exit 0
fi

echo "🚀 Gửi lệnh tới Kaggle GPU..."
echo "📡 Tunnel: $TUNNEL_URL"
echo "---"

sshpass -p "$PASSWORD" ssh \
    -o StrictHostKeyChecking=no \
    -o ProxyCommand="$CLOUDFLARED access ssh --hostname $TUNNEL_URL" \
    root@$TUNNEL_URL \
    "$ENV_SETUP && $1"
