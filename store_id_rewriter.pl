#!/usr/bin/perl
# Store ID Rewriter for Squid - Improves caching efficiency
# This script helps Squid cache similar content more effectively

use strict;
use warnings;

# Flush output immediately
$| = 1;

while (my $line = <STDIN>) {
    chomp $line;
    
    # Parse the input line
    my ($channel_id, $url) = split /\s+/, $line, 2;
    
    # Default response
    my $response = "$channel_id $url";
    
    # YouTube video caching optimization
    if ($url =~ m{^https?://[^/]*\.googlevideo\.com/}) {
        # Remove session-specific parameters for better caching
        $url =~ s/[&?]range=[^&]*//g;
        $url =~ s/[&?]ratebypass=[^&]*//g;
        $url =~ s/[&?]mime=[^&]*//g;
        $url =~ s/[&?]gir=[^&]*//g;
        $url =~ s/[&?]clen=[^&]*//g;
        $url =~ s/[&?]dur=[^&]*//g;
        $url =~ s/[&?]lmt=[^&]*//g;
        $response = "$channel_id $url";
    }
    
    # Facebook content optimization
    elsif ($url =~ m{^https?://[^/]*\.facebook\.com/}) {
        # Remove tracking parameters
        $url =~ s/[&?]_nc_[^&]*//g;
        $url =~ s/[&?]oh=[^&]*//g;
        $url =~ s/[&?]oe=[^&]*//g;
        $response = "$channel_id $url";
    }
    
    # Google services optimization
    elsif ($url =~ m{^https?://[^/]*\.google\.com/}) {
        # Remove session tokens and tracking
        $url =~ s/[&?]authuser=[^&]*//g;
        $url =~ s/[&?]token=[^&]*//g;
        $url =~ s/[&?]_=[^&]*//g;
        $response = "$channel_id $url";
    }
    
    # Amazon content optimization
    elsif ($url =~ m{^https?://[^/]*\.amazon\.com/}) {
        # Remove session and tracking parameters
        $url =~ s/[&?]ref=[^&]*//g;
        $url =~ s/[&?]tag=[^&]*//g;
        $url =~ s/[&?]linkCode=[^&]*//g;
        $response = "$channel_id $url";
    }
    
    # CDN optimization for common libraries
    elsif ($url =~ m{^https?://[^/]*\.cloudflare\.com/}) {
        # These are usually static, good for caching as-is
        $response = "$channel_id $url";
    }
    
    # Generic parameter cleanup for better caching
    else {
        # Remove common tracking parameters
        $url =~ s/[&?]utm_[^&]*//g;
        $url =~ s/[&?]fbclid=[^&]*//g;
        $url =~ s/[&?]gclid=[^&]*//g;
        $url =~ s/[&?]_ga=[^&]*//g;
        $url =~ s/[&?]sessionid=[^&]*//g;
        $url =~ s/[&?]timestamp=[^&]*//g;
        $url =~ s/[&?]t=[0-9]+//g;
        $url =~ s/[&?]v=[0-9]+//g;
        $response = "$channel_id $url";
    }
    
    print "$response\n";
}
