#!/usr/bin/perl
# URL Rewriter for Squid - Handles CSS/JS minification and media compression

use strict;
use warnings;

$| = 1;

while (my $line = <STDIN>) {
    chomp $line;
    my ($channel_id, $url) = split /\s+/, $line, 2;

    # Handle CSS and JS minification
    if ($url =~ /\.(css|js)(\?.*)?$/i) {
        my $ext = lc($1);
        my $minified_url = $url;

        # Add minification parameter
        $minified_url .= ($url =~ /\?/ ? '&' : '?') . "minify=$ext";
        print "$channel_id $minified_url\n";
    }

    # Handle image compression
    elsif ($url =~ /\.(jpg|jpeg|png|gif|webp|bmp|tiff)(\?.*)?$/i) {
        my $compressed_url = $url;

        # Add image compression parameters for better bandwidth usage
        $compressed_url .= ($url =~ /\?/ ? '&' : '?') . 'compress=image&quality=80';
        print "$channel_id $compressed_url\n";
    }

    # Handle video compression hints
    elsif ($url =~ /\.(mp4|mpeg|mov|avi|webm|ogg|3gp|flv)(\?.*)?$/i) {
        my $compressed_url = $url;

        # Add video compression parameters
        $compressed_url .= ($url =~ /\?/ ? '&' : '?') . 'compress=video&bitrate=adaptive';
        print "$channel_id $compressed_url\n";
    }

    else {
        # Return original URL for other file types
        print "$channel_id $url\n";
    }
}
