#!/bin/bash
echo "=========================================================="
echo "🚀 VOXORA - PRIVATE GPU SERVER SETUP (Ubuntu/Debian)"
echo "=========================================================="

# 1. Update and install dependencies
echo "[1/4] Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git ffmpeg python3-pip python3-venv tmux

# 2. Clone project if not exist
if [ ! -d "Voxora" ]; then
    echo "[2/4] Cloning Voxora repository..."
    git clone https://github.com/khanhkhmt/Voxora.git
fi

cd Voxora

# 3. Setup Python Virtual Environment for AI Engine
echo "[3/4] Setting up Python environment..."
python3 -m venv venv_ai
source venv_ai/bin/activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install gradio soundfile librosa numpy "transformers>=4.45.0" "gradio>=4.32.1"
pip install -e .

# 4. Create runner script
echo "[4/4] Creating startup script..."
cat << 'EOF' > start_ai_engine.sh
#!/bin/bash
source venv_ai/bin/activate
# Chạy app.py mở cổng 8808 ra mọi IP nội bộ/public (0.0.0.0)
export GRADIO_SERVER_NAME="0.0.0.0"
export GRADIO_SERVER_PORT=8808
python app.py
EOF

chmod +x start_ai_engine.sh

echo "=========================================================="
echo "✅ SETUP HOÀN TẤT!"
echo "Để chạy AI Engine, gõ lệnh:"
echo "./start_ai_engine.sh"
echo "Sau đó sửa file .env ở Backend thành: VOXCPM_GRADIO_URL=http://<IP-CUẢ-SERVER-NÀY>:8808"
echo "=========================================================="
