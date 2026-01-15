#!/bin/bash

# Store Screenshots Helper Script
# Usage: ./take-screenshots.sh [intentmatch|voicefirst]

APP=${1:-intentmatch}
SCREENSHOT_DIR="$(dirname "$0")/screenshots/$APP"

mkdir -p "$SCREENSHOT_DIR"

echo "========================================="
echo "  Store Screenshots - $APP"
echo "========================================="
echo ""
echo "Screenshots needed for $APP:"
echo ""

if [ "$APP" == "intentmatch" ]; then
    echo "  1. Login/Signup screen"
    echo "  2. Discovery/Swiping screen"
    echo "  3. Match & Chat screen"
    echo "  4. Availability calendar"
    echo "  5. Venue suggestions"
    echo "  6. Profile screen"
else
    echo "  1. Login/Signup screen"
    echo "  2. Voice intro recording screen"
    echo "  3. Discovery/Listening screen (blurred photos)"
    echo "  4. Match screen with photo reveal"
    echo "  5. Voice messaging conversation"
    echo "  6. Profile screen"
fi

echo ""
echo "========================================="
echo ""
echo "Instructions:"
echo "  1. Run 'npx expo start --android' in the app folder"
echo "  2. Navigate to each screen in the emulator"
echo "  3. Press ENTER here to capture screenshot"
echo "  4. Repeat for each screen"
echo ""
echo "Screenshots will be saved to: $SCREENSHOT_DIR"
echo ""

# Screenshot counter
COUNT=1

while true; do
    read -p "Press ENTER to take screenshot #$COUNT (or 'q' to quit): " input

    if [ "$input" == "q" ] || [ "$input" == "Q" ]; then
        echo ""
        echo "Done! Screenshots saved to: $SCREENSHOT_DIR"
        ls -la "$SCREENSHOT_DIR"
        exit 0
    fi

    FILENAME="$SCREENSHOT_DIR/screenshot_${COUNT}.png"
    adb exec-out screencap -p > "$FILENAME"

    if [ $? -eq 0 ]; then
        echo "  Saved: $FILENAME"
        COUNT=$((COUNT + 1))
    else
        echo "  Error: Failed to capture screenshot. Is the emulator running?"
    fi
done
