#!/bin/bash
# Setup script for Squid with Image and Video Compression

echo "Setting up Squid Proxy with Image and Video Compression..."

# Install additional packages for media compression
echo "Installing media compression tools..."
sudo apt update
sudo apt install -y imagemagick ffmpeg jpegoptim optipng pngquant webp

# Install Perl modules for media handling
echo "Installing Perl modules..."
sudo apt install -y libimage-magick-perl libfile-temp-perl

# Copy updated scripts
echo "Installing updated compression scripts..."
sudo cp url_minifier.pl /usr/local/bin/
sudo cp media_compressor.pl /usr/local/bin/
sudo chmod +x /usr/local/bin/url_minifier.pl
sudo chmod +x /usr/local/bin/media_compressor.pl

# Copy updated configuration
echo "Installing updated Squid configuration..."
sudo cp squid.conf /etc/squid/squid.conf

# Test configuration
echo "Testing Squid configuration..."
if sudo squid -k parse; then
    echo "✓ Configuration is valid"
else
    echo "✗ Configuration has errors"
    exit 1
fi

# Restart Squid
echo "Restarting Squid service..."
sudo systemctl restart squid

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet squid; then
    echo "✓ Squid service is running"
else
    echo "✗ Squid service failed to start"
    sudo systemctl status squid --no-pager
    exit 1
fi

echo ""
echo "=== Media Compression Setup Complete ==="
echo "Features enabled:"
echo "  ✓ Image compression (JPEG, PNG, GIF, WebP, BMP, TIFF, SVG)"
echo "  ✓ Video compression hints (MP4, MPEG, MOV, AVI, WebM, OGG, 3GP, FLV)"
echo "  ✓ CSS/JS minification"
echo "  ✓ Extended caching for media files"
echo "  ✓ Larger cache sizes for better compression"
echo ""
echo "Cache settings:"
echo "  - Memory cache: 512 MB"
echo "  - Max object size: 5 GB"
echo "  - Max memory object: 4 MB"
echo "  - Images cached for 12 hours (90% refresh)"
echo "  - Videos cached for 24 hours (95% refresh)"
echo ""
echo "Compression tools installed:"
echo "  - ImageMagick (image processing)"
echo "  - FFmpeg (video processing)"
echo "  - jpegoptim (JPEG optimization)"
echo "  - optipng (PNG optimization)"
echo "  - pngquant (PNG compression)"
echo "  - webp (WebP conversion)"
echo ""
echo "To test media compression:"
echo "  curl -x $(hostname -I | awk '{print $1}'):3128 -I http://example.com/image.jpg"
echo "  curl -x $(hostname -I | awk '{print $1}'):3128 -I http://example.com/video.mp4"
