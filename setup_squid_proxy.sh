#!/bin/bash
# Squid Proxy Setup Script with Ultra Compression, Ad Blocking & Minification

echo "Setting up Squid Proxy with Ultra Data Compression and Ad Blocking..."

# Update system packages
echo "Updating system packages..."
sudo apt update

# Install Squid and required dependencies
echo "Installing Squid and dependencies..."
sudo apt install -y squid squid-common squid-langpack perl

# Stop Squid service if running
echo "Stopping Squid service..."
sudo systemctl stop squid

# Backup original configuration
echo "Backing up original squid.conf..."
sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.backup

# Copy our configuration files
echo "Installing custom Squid configuration..."
sudo cp squid.conf /etc/squid/squid.conf
sudo cp ad_block_domains.txt /etc/squid/ad_block_domains.txt

# Create helper script directories
echo "Setting up helper scripts..."
sudo mkdir -p /usr/local/bin

# Copy and set permissions for helper scripts
sudo cp store_id_rewriter.pl /usr/local/bin/
sudo cp url_minifier.pl /usr/local/bin/
sudo chmod +x /usr/local/bin/store_id_rewriter.pl
sudo chmod +x /usr/local/bin/url_minifier.pl

# Create cache directories
echo "Creating cache directories..."
sudo mkdir -p /var/spool/squid
sudo chown proxy:proxy /var/spool/squid

# Create log directories
echo "Setting up logging..."
sudo mkdir -p /var/log/squid
sudo chown proxy:proxy /var/log/squid

# Initialize cache
echo "Initializing Squid cache..."
sudo squid -z

# Set proper permissions
echo "Setting permissions..."
sudo chown -R proxy:proxy /var/spool/squid
sudo chown -R proxy:proxy /var/log/squid
sudo chmod -R 755 /var/spool/squid

# Configure firewall (if ufw is active)
echo "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 3128/tcp
    echo "Firewall rule added for port 3128"
fi

# Start and enable Squid service
echo "Starting Squid service..."
sudo systemctl start squid
sudo systemctl enable squid

# Check service status
echo "Checking Squid service status..."
sudo systemctl status squid --no-pager

# Display configuration summary
echo ""
echo "=== Squid Proxy Setup Complete ==="
echo "Port: 3128"
echo "Access: All networks allowed (0.0.0.0/0)"
echo "Features:"
echo "  ✓ Ultra data compression"
echo "  ✓ Ad blocking"
echo "  ✓ Content minification"
echo "  ✓ Caching optimization"
echo ""
echo "Configuration files:"
echo "  - Main config: /etc/squid/squid.conf"
echo "  - Ad domains: /etc/squid/ad_block_domains.txt"
echo "  - Store ID rewriter: /usr/local/bin/store_id_rewriter.pl"
echo "  - URL minifier: /usr/local/bin/url_minifier.pl"
echo ""
echo "Logs:"
echo "  - Access log: /var/log/squid/access.log"
echo "  - Cache log: /var/log/squid/cache.log"
echo ""
echo "To use the proxy, configure your browser or system to use:"
echo "HTTP Proxy: $(hostname -I | awk '{print $1}'):3128"
echo ""
echo "To test: curl -x $(hostname -I | awk '{print $1}'):3128 http://example.com"
echo ""
echo "To restart Squid: sudo systemctl restart squid"
echo "To view logs: sudo tail -f /var/log/squid/access.log"
