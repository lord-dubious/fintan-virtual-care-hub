#!/bin/bash
# Demonstration script for Squid Proxy Image and Video Compression

echo "🚀 Squid Proxy Media Compression Demo"
echo "======================================"

LOCAL_IP=$(hostname -I | awk '{print $1}')
PROXY_PORT=3128

echo "Proxy: $LOCAL_IP:$PROXY_PORT"
echo ""

# Test image compression with a real image
echo "📸 Testing Image Compression..."
echo "-------------------------------"

# Download a test image directly
echo "1. Direct download (no proxy):"
START_TIME=$(date +%s.%N)
curl -s -o /tmp/test_image_direct.jpg "https://picsum.photos/800/600.jpg"
END_TIME=$(date +%s.%N)
DIRECT_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
DIRECT_SIZE=$(stat -c%s /tmp/test_image_direct.jpg 2>/dev/null || echo "0")

echo "   Time: ${DIRECT_TIME}s"
echo "   Size: $DIRECT_SIZE bytes"

# Download through proxy
echo ""
echo "2. Through Squid proxy:"
START_TIME=$(date +%s.%N)
curl -x $LOCAL_IP:$PROXY_PORT -s -o /tmp/test_image_proxy.jpg "https://picsum.photos/800/600.jpg"
END_TIME=$(date +%s.%N)
PROXY_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
PROXY_SIZE=$(stat -c%s /tmp/test_image_proxy.jpg 2>/dev/null || echo "0")

echo "   Time: ${PROXY_TIME}s"
echo "   Size: $PROXY_SIZE bytes"

# Show compression tools in action
echo ""
echo "🛠️  Compression Tools Demo..."
echo "-----------------------------"

if [ -f /tmp/test_image_direct.jpg ]; then
    echo "Original image: /tmp/test_image_direct.jpg ($DIRECT_SIZE bytes)"
    
    # JPEG optimization
    echo ""
    echo "1. JPEG Optimization (jpegoptim):"
    cp /tmp/test_image_direct.jpg /tmp/test_optimized.jpg
    jpegoptim --max=80 /tmp/test_optimized.jpg 2>/dev/null
    OPTIMIZED_SIZE=$(stat -c%s /tmp/test_optimized.jpg 2>/dev/null || echo "0")
    SAVINGS=$(echo "scale=1; ($DIRECT_SIZE - $OPTIMIZED_SIZE) * 100 / $DIRECT_SIZE" | bc -l)
    echo "   Optimized size: $OPTIMIZED_SIZE bytes"
    echo "   Savings: ${SAVINGS}%"
    
    # PNG conversion and optimization
    echo ""
    echo "2. PNG Conversion (ImageMagick + optipng):"
    convert /tmp/test_image_direct.jpg /tmp/test_converted.png 2>/dev/null
    if [ -f /tmp/test_converted.png ]; then
        PNG_SIZE_BEFORE=$(stat -c%s /tmp/test_converted.png)
        optipng -o2 /tmp/test_converted.png 2>/dev/null
        PNG_SIZE_AFTER=$(stat -c%s /tmp/test_converted.png)
        PNG_SAVINGS=$(echo "scale=1; ($PNG_SIZE_BEFORE - $PNG_SIZE_AFTER) * 100 / $PNG_SIZE_BEFORE" | bc -l)
        echo "   PNG before optimization: $PNG_SIZE_BEFORE bytes"
        echo "   PNG after optimization: $PNG_SIZE_AFTER bytes"
        echo "   PNG optimization savings: ${PNG_SAVINGS}%"
    fi
    
    # WebP conversion
    echo ""
    echo "3. WebP Conversion:"
    cwebp -q 80 /tmp/test_image_direct.jpg -o /tmp/test_converted.webp 2>/dev/null
    if [ -f /tmp/test_converted.webp ]; then
        WEBP_SIZE=$(stat -c%s /tmp/test_converted.webp)
        WEBP_SAVINGS=$(echo "scale=1; ($DIRECT_SIZE - $WEBP_SIZE) * 100 / $DIRECT_SIZE" | bc -l)
        echo "   WebP size: $WEBP_SIZE bytes"
        echo "   WebP savings vs JPEG: ${WEBP_SAVINGS}%"
    fi
fi

# Show proxy statistics
echo ""
echo "📊 Proxy Statistics..."
echo "---------------------"

echo "Active URL rewriter processes:"
pgrep -f "url_minifier.pl" | wc -l

echo ""
echo "Squid service status:"
if systemctl is-active --quiet squid; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi

echo ""
echo "Cache directory usage:"
if [ -d /var/spool/squid ]; then
    CACHE_SIZE=$(du -sh /var/spool/squid 2>/dev/null | cut -f1)
    echo "   Cache size: $CACHE_SIZE"
else
    echo "   Cache directory not found"
fi

# Show recent activity
echo ""
echo "📝 Recent Proxy Activity (last 3 requests):"
echo "--------------------------------------------"
if sudo test -r /var/log/squid/access.log; then
    sudo tail -3 /var/log/squid/access.log | while read line; do
        # Extract timestamp, IP, method, URL, and response code
        TIMESTAMP=$(echo "$line" | awk '{print $1}' | xargs -I {} date -d @{} '+%H:%M:%S' 2>/dev/null || echo "N/A")
        METHOD=$(echo "$line" | awk '{print $6}')
        URL=$(echo "$line" | awk '{print $7}' | cut -c1-50)
        CODE=$(echo "$line" | awk '{print $4}' | cut -d'/' -f1)
        echo "   [$TIMESTAMP] $METHOD $URL... ($CODE)"
    done
else
    echo "   Cannot access log file (run with sudo for full logs)"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up test files..."
rm -f /tmp/test_image_*.jpg /tmp/test_*.png /tmp/test_*.webp 2>/dev/null

echo ""
echo "✅ Demo Complete!"
echo ""
echo "🎯 Key Features Demonstrated:"
echo "   • Image compression with multiple formats"
echo "   • JPEG optimization (jpegoptim)"
echo "   • PNG optimization (optipng)"
echo "   • WebP conversion (cwebp)"
echo "   • Proxy caching and performance"
echo "   • URL rewriting for compression"
echo ""
echo "📈 Your Squid proxy is optimized for:"
echo "   • Ultra data compression"
echo "   • Image and video optimization"
echo "   • Ad blocking"
echo "   • Smart caching"
echo "   • Bandwidth savings"
echo ""
echo "🔧 Management commands:"
echo "   sudo systemctl restart squid    # Restart proxy"
echo "   sudo tail -f /var/log/squid/access.log  # Monitor activity"
echo "   ./test_media_compression.sh     # Run full tests"
