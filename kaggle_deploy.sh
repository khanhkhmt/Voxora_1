#!/bin/bash
# ============================================
# Script: Sửa code local → Deploy lên Kaggle GPU
# 
# Cách dùng:
#   ./kaggle_deploy.sh              ← Upload toàn bộ code + restart app
#   ./kaggle_deploy.sh app.py       ← Upload 1 file cụ thể + restart app
#   ./kaggle_deploy.sh --no-restart ← Chỉ upload, không restart
#   ./kaggle_deploy.sh status       ← Kiểm tra trạng thái
# ============================================

# ⬇️⬇️⬇️ DÁN LINK KAGGLE TUNNEL VÀO ĐÂY (có hoặc không có https:// đều được) ⬇️⬇️⬇️
TUNNEL_URL="${KAGGLE_TUNNEL:-administration-wal-voip-estimation.trycloudflare.com/}"
# ⬆️⬆️⬆️ CHỈ CẦN SỬA DÒNG TRÊN MỖI KHI CÓ LINK MỚI ⬆️⬆️⬆️

# Tự động cắt bỏ https:// nếu bạn có lỡ điền vào
TUNNEL_HOSTNAME="${TUNNEL_URL#https://}"
TUNNEL_HOSTNAME="${TUNNEL_HOSTNAME%/}"

PASSWORD="kaggle123"
CLOUDFLARED="/tmp/cloudflared"
LOCAL_DIR="/home/khanhnq/project/VoxCPM"
REMOTE_DIR="/kaggle/working/VoxCPM"

PROXY_CMD="$CLOUDFLARED access ssh --hostname $TUNNEL_HOSTNAME"
SSH_CMD=(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ProxyCommand="$PROXY_CMD" "root@$TUNNEL_HOSTNAME")
SCP_CMD=(sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -o ProxyCommand="$PROXY_CMD")

ENV="export LD_LIBRARY_PATH=/usr/local/nvidia/lib64:\$LD_LIBRARY_PATH && export PATH=/opt/bin:\$PATH"

# --- Kiểm tra trạng thái ---
if [ "$1" = "status" ]; then
    echo "📡 Kiểm tra trạng thái Kaggle..."
    "${SSH_CMD[@]}" "$ENV && echo '✅ SSH OK' && nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader && ps aux | grep app.py | grep -v grep | awk '{print \"App PID: \"\$2}' && curl -s -o /dev/null -w 'Web: HTTP %{http_code}\n' http://localhost:7860"
    exit 0
fi

# --- Upload code ---
NO_RESTART=false
FILE=""

for arg in "$@"; do
    if [ "$arg" = "--no-restart" ]; then
        NO_RESTART=true
    elif [ -f "$LOCAL_DIR/$arg" ]; then
        FILE="$arg"
    fi
done

if [ -n "$FILE" ]; then
    echo "📤 Upload file: $FILE"
    "${SCP_CMD[@]}" "$LOCAL_DIR/$FILE" "root@$TUNNEL_HOSTNAME:$REMOTE_DIR/$FILE"
else
    echo "📤 Upload toàn bộ code (trừ .git, __pycache__)..."
    cd "$LOCAL_DIR"
    for f in $(find . -name "*.py" -o -name "*.yaml" -o -name "*.toml" -o -name "*.md" | grep -v '.git\|__pycache__'); do
        echo "  → $f"
        "${SCP_CMD[@]}" "$f" "root@$TUNNEL_HOSTNAME:$REMOTE_DIR/$f"
    done
fi
echo "✅ Upload xong!"

# --- Restart ---
if [ "$NO_RESTART" = false ]; then
    echo ""
    echo "🔄 Restart VoxCPM app..."
    "${SSH_CMD[@]}" "$ENV && kill \$(pgrep -f 'python3 app.py') 2>/dev/null; sleep 2; cd $REMOTE_DIR && sed -i 's/server_name=server_name,/server_name=\"0.0.0.0\",\n        share=True,/' app.py 2>/dev/null; nohup python3 app.py --port 7860 > /kaggle/working/app.log 2>&1 & echo 'Restarted PID:' \$!"
    echo ""
    echo "⏳ Đợi model load (~3-5 phút)..."
    echo "🔗 Link vẫn là: https://color-sandra-cure-careers.trycloudflare.com"
else
    echo "⏩ Bỏ qua restart (--no-restart)"
fi
