#!/bin/bash
# Test script for Squid Proxy functionality

echo "Testing Squid Proxy Configuration..."

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
PROXY_PORT=3128

echo "Proxy Address: $LOCAL_IP:$PROXY_PORT"
echo ""

# Test 1: Basic connectivity
echo "=== Test 1: Basic Proxy Connectivity ==="
if curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null -w "%{http_code}" http://example.com | grep -q "200"; then
    echo "✓ Basic proxy connectivity: PASSED"
else
    echo "✗ Basic proxy connectivity: FAILED"
fi

# Test 2: HTTPS connectivity
echo ""
echo "=== Test 2: HTTPS Connectivity ==="
if curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null -w "%{http_code}" https://www.google.com | grep -q "200"; then
    echo "✓ HTTPS connectivity: PASSED"
else
    echo "✗ HTTPS connectivity: FAILED"
fi

# Test 3: Ad blocking
echo ""
echo "=== Test 3: Ad Blocking ==="
if curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null -w "%{http_code}" http://googleads.g.doubleclick.net 2>/dev/null | grep -q "403\|000"; then
    echo "✓ Ad blocking: PASSED (blocked googleads.g.doubleclick.net)"
else
    echo "✗ Ad blocking: FAILED (should block ad domains)"
fi

# Test 4: Compression headers
echo ""
echo "=== Test 4: Compression Support ==="
COMPRESSION_TEST=$(curl -x $LOCAL_IP:$PROXY_PORT -H "Accept-Encoding: gzip, deflate" -s -I http://example.com | grep -i "content-encoding")
if [ ! -z "$COMPRESSION_TEST" ]; then
    echo "✓ Compression headers: PASSED"
    echo "  $COMPRESSION_TEST"
else
    echo "? Compression headers: Not detected (may still be working)"
fi

# Test 5: Cache functionality
echo ""
echo "=== Test 5: Cache Functionality ==="
echo "First request (should be MISS):"
curl -x $LOCAL_IP:$PROXY_PORT -s -I http://example.com | grep -i "x-cache\|via"

echo "Second request (should be HIT or from cache):"
curl -x $LOCAL_IP:$PROXY_PORT -s -I http://example.com | grep -i "x-cache\|via"

# Test 6: Service status
echo ""
echo "=== Test 6: Service Status ==="
if systemctl is-active --quiet squid; then
    echo "✓ Squid service: RUNNING"
else
    echo "✗ Squid service: NOT RUNNING"
fi

# Test 7: Log files
echo ""
echo "=== Test 7: Log Files ==="
if [ -f /var/log/squid/access.log ]; then
    echo "✓ Access log: EXISTS"
    echo "  Recent entries: $(wc -l < /var/log/squid/access.log) lines"
else
    echo "✗ Access log: MISSING"
fi

if [ -f /var/log/squid/cache.log ]; then
    echo "✓ Cache log: EXISTS"
else
    echo "✗ Cache log: MISSING"
fi

# Test 8: Configuration syntax
echo ""
echo "=== Test 8: Configuration Syntax ==="
if sudo squid -k parse 2>/dev/null; then
    echo "✓ Configuration syntax: VALID"
else
    echo "✗ Configuration syntax: INVALID"
    echo "Run 'sudo squid -k parse' for details"
fi

# Performance test
echo ""
echo "=== Performance Test ==="
echo "Testing response times..."

# Without proxy
echo -n "Direct connection: "
curl -s -o /dev/null -w "%{time_total}s\n" http://example.com

# With proxy
echo -n "Through proxy: "
curl -x $LOCAL_IP:$PROXY_PORT -s -o /dev/null -w "%{time_total}s\n" http://example.com

echo ""
echo "=== Test Complete ==="
echo "Check /var/log/squid/access.log for detailed request logs"
echo "Check /var/log/squid/cache.log for cache and error information"
