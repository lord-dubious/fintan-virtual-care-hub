#!/usr/bin/perl
# Media Compressor for Squid - Compresses images and videos on-the-fly

use strict;
use warnings;
use File::Temp qw(tempfile);
use File::Copy;

$| = 1;

while (my $line = <STDIN>) {
    chomp $line;
    my ($channel_id, $url) = split /\s+/, $line, 2;
    
    # Check if URL is for compressible media
    if ($url =~ /\.(jpg|jpeg|png|gif|webp|bmp|tiff|mp4|mpeg|mov|avi|webm|ogg|3gp|flv)(\?.*)?$/i) {
        my $ext = lc($1);
        
        # For images - redirect to compression service
        if ($ext =~ /^(jpg|jpeg|png|gif|webp|bmp|tiff)$/) {
            # Add image compression parameters
            my $compressed_url = $url;
            $compressed_url .= ($url =~ /\?/ ? '&' : '?') . 'compress=image&quality=75';
            print "$channel_id $compressed_url\n";
        }
        
        # For videos - add compression hints
        elsif ($ext =~ /^(mp4|mpeg|mov|avi|webm|ogg|3gp|flv)$/) {
            # Add video compression parameters
            my $compressed_url = $url;
            $compressed_url .= ($url =~ /\?/ ? '&' : '?') . 'compress=video&bitrate=medium';
            print "$channel_id $compressed_url\n";
        }
        
        else {
            # Return original URL for unsupported formats
            print "$channel_id $url\n";
        }
    } else {
        # Return original URL for non-media files
        print "$channel_id $url\n";
    }
}
