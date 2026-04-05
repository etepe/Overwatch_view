#!/bin/bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ========================================"
echo "    OVERWATCH - Geopolitical Intelligence"
echo -e "  ========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "  ${RED}[!] Docker is not running.${NC}"
    echo "  [!] Please install and start Docker Desktop first:"
    echo "      https://www.docker.com/products/docker-desktop/"
    echo ""
    exit 1
fi

echo -e "  ${GREEN}[OK]${NC} Docker is running."
echo ""

# Stop and remove existing container if running
docker stop overwatch > /dev/null 2>&1
docker rm overwatch > /dev/null 2>&1

# Build the image
echo "  [..] Building Overwatch image (this may take a minute)..."
echo ""
docker build -t overwatch .
if [ $? -ne 0 ]; then
    echo ""
    echo -e "  ${RED}[!] Build failed. Check the errors above.${NC}"
    exit 1
fi

echo ""
echo -e "  ${GREEN}[OK]${NC} Build complete."
echo ""

# Run the container
echo "  [..] Starting container on port 8080..."
docker run -d -p 8080:80 --name overwatch overwatch
if [ $? -ne 0 ]; then
    echo ""
    echo -e "  ${RED}[!] Failed to start container.${NC}"
    echo "  [!] Port 8080 may be in use. Try: lsof -i :8080"
    exit 1
fi

echo ""
echo -e "${CYAN}  ========================================"
echo "    OVERWATCH is running!"
echo "    Open: http://localhost:8080"
echo -e "  ========================================${NC}"
echo ""

# Open browser
sleep 2
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
elif command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8080
fi

echo "  Press Ctrl+C to stop the server..."
echo ""

# Wait for Ctrl+C
trap cleanup INT
cleanup() {
    echo ""
    echo "  [..] Stopping Overwatch..."
    docker stop overwatch > /dev/null 2>&1
    docker rm overwatch > /dev/null 2>&1
    echo -e "  ${GREEN}[OK]${NC} Stopped. Goodbye."
    exit 0
}

# Keep running
while true; do
    sleep 1
done
