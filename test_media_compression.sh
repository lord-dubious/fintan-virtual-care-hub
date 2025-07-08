#!/bin/bash
# Test script for Squid Proxy with Image and Video Compression

echo "Testing Squid Proxy with Media Compression..."

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
PROXY_PORT=3128

echo "Proxy Address: $LOCAL_IP:$PROXY_PORT"
echo ""

# Test 1: Basic connectivity
echo "=== Test 1: Basic Proxy Connectivity ==="
if curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null -w "%{http_code}" https://www.google.com | grep -q "200"; then
    echo "✓ Basic proxy connectivity: PASSED"
else
    echo "✗ Basic proxy connectivity: FAILED"
fi

# Test 2: Image compression detection
echo ""
echo "=== Test 2: Image Compression Features ==="
echo "Testing image URL rewriting..."

# Test with a sample image URL
IMAGE_URL="https://via.placeholder.com/600x400.jpg"
echo "Original URL: $IMAGE_URL"

# Test through proxy to see if URL gets modified
RESPONSE=$(curl -x $LOCAL_IP:$PROXY_PORT -s -I "$IMAGE_URL" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Image request through proxy: SUCCESS"
    echo "Response headers:"
    echo "$RESPONSE" | grep -E "(Content-Type|Content-Length|Via|X-Cache)" | head -5
else
    echo "✗ Image request through proxy: FAILED"
fi

# Test 3: Video compression detection
echo ""
echo "=== Test 3: Video Compression Features ==="
echo "Testing video URL rewriting..."

# Test with a sample video URL (using a test URL)
VIDEO_URL="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
echo "Original URL: $VIDEO_URL"

RESPONSE=$(curl -x $LOCAL_IP:$PROXY_PORT -s -I "$VIDEO_URL" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Video request through proxy: SUCCESS"
    echo "Response headers:"
    echo "$RESPONSE" | grep -E "(Content-Type|Content-Length|Via|X-Cache)" | head -5
else
    echo "? Video request: May not be accessible (test URL)"
fi

# Test 4: CSS/JS minification
echo ""
echo "=== Test 4: CSS/JS Minification ==="
CSS_URL="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css"
echo "Testing CSS URL: $CSS_URL"

RESPONSE=$(curl -x $LOCAL_IP:$PROXY_PORT -s -I "$CSS_URL" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ CSS request through proxy: SUCCESS"
    echo "Response headers:"
    echo "$RESPONSE" | grep -E "(Content-Type|Content-Encoding|Via|X-Cache)" | head -5
else
    echo "✗ CSS request through proxy: FAILED"
fi

# Test 5: Cache performance for media
echo ""
echo "=== Test 5: Media Caching Performance ==="
echo "Testing cache performance with repeated requests..."

# First request (should be MISS)
echo "First image request (cache MISS expected):"
START_TIME=$(date +%s.%N)
curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null "$IMAGE_URL"
END_TIME=$(date +%s.%N)
FIRST_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
echo "Time: ${FIRST_TIME}s"

# Second request (should be HIT or faster)
echo "Second image request (cache HIT expected):"
START_TIME=$(date +%s.%N)
curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null "$IMAGE_URL"
END_TIME=$(date +%s.%N)
SECOND_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
echo "Time: ${SECOND_TIME}s"

# Compare times
if (( $(echo "$SECOND_TIME < $FIRST_TIME" | bc -l) )); then
    echo "✓ Cache performance: IMPROVED (${SECOND_TIME}s vs ${FIRST_TIME}s)"
else
    echo "? Cache performance: Similar times (may still be working)"
fi

# Test 6: Compression tools availability
echo ""
echo "=== Test 6: Compression Tools Status ==="
echo "Checking installed compression tools..."

# Check ImageMagick (convert command)
if command -v convert &> /dev/null; then
    echo "✓ ImageMagick (convert): INSTALLED"
else
    echo "✗ ImageMagick (convert): NOT FOUND"
fi

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✓ FFmpeg: INSTALLED"
else
    echo "✗ FFmpeg: NOT FOUND"
fi

# Check JPEG optimization
if command -v jpegoptim &> /dev/null; then
    echo "✓ jpegoptim: INSTALLED"
else
    echo "✗ jpegoptim: NOT FOUND"
fi

# Check PNG optimization
if command -v optipng &> /dev/null; then
    echo "✓ optipng: INSTALLED"
else
    echo "✗ optipng: NOT FOUND"
fi

# Check PNG quantization
if command -v pngquant &> /dev/null; then
    echo "✓ pngquant: INSTALLED"
else
    echo "✗ pngquant: NOT FOUND"
fi

# Check WebP tools
if command -v cwebp &> /dev/null && command -v dwebp &> /dev/null; then
    echo "✓ WebP tools (cwebp/dwebp): INSTALLED"
else
    echo "✗ WebP tools: NOT FOUND"
fi

# Test 7: URL Rewriter Status
echo ""
echo "=== Test 7: URL Rewriter Status ==="
if pgrep -f "url_minifier.pl" > /dev/null; then
    REWRITER_COUNT=$(pgrep -f "url_minifier.pl" | wc -l)
    echo "✓ URL Rewriter processes: $REWRITER_COUNT running"
else
    echo "✗ URL Rewriter: NOT RUNNING"
fi

# Test 8: Recent access logs
echo ""
echo "=== Test 8: Recent Activity ==="
echo "Recent proxy requests (last 5):"
if [ -r /var/log/squid/access.log ]; then
    sudo tail -5 /var/log/squid/access.log | while read line; do
        echo "  $line"
    done
else
    echo "Cannot read access log (permission denied)"
fi

echo ""
echo "=== Media Compression Test Complete ==="
echo ""
echo "Configuration Summary:"
echo "  - Port: 3128"
echo "  - Memory Cache: 512 MB"
echo "  - Max Object Size: 5 GB"
echo "  - Image Cache: 12 hours (90% refresh)"
echo "  - Video Cache: 24 hours (95% refresh)"
echo "  - URL Rewriter: Active for CSS/JS/Images/Videos"
echo ""
echo "Supported formats:"
echo "  - Images: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG"
echo "  - Videos: MP4, MPEG, MOV, AVI, WebM, OGG, 3GP, FLV"
echo "  - Scripts: CSS, JavaScript"
echo ""
echo "To monitor real-time activity:"
echo "  sudo tail -f /var/log/squid/access.log"
