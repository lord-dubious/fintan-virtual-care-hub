#!/usr/bin/perl
# Store ID Rewriter for Squid - Simplified version

use strict;
use warnings;

$| = 1;

while (my $line = <STDIN>) {
    chomp $line;
    
    # Just pass through the original line unchanged for now
    # This prevents URL corruption while maintaining basic functionality
    print "$line\n";
}
