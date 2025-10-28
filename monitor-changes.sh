#!/bin/bash

echo "Monitoring for file changes in the project..."
echo "Press Ctrl+C to stop monitoring"

# Monitor for any file changes in the src directory
fswatch -o src/ | while read f; do
    echo "$(date): File change detected"
done
