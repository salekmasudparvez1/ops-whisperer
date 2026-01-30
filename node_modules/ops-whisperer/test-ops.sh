#!/bin/bash
# Test script for ops command
echo "Testing ops command with auto-confirm..."
(echo; sleep 1) | ops "create a simple nodejs dockerfile" --type docker
