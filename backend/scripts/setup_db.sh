#!/bin/bash

# University Portal Database Setup Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}University Portal - Database Setup${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "$SCRIPT_DIR/setup_database.py" ]; then
    echo -e "${RED}Error: setup_database.py not found${NC}"
    echo -e "${RED}Please run this script from the backend/scripts directory${NC}"
    exit 1
fi

# Change to the backend directory
cd "$BACKEND_DIR"

echo -e "${GREEN}Current directory: $(pwd)${NC}"
echo -e "${YELLOW}Starting database setup script...${NC}"
echo ""

# Run the Python script
python3 scripts/setup_database.py

echo ""
echo -e "${BLUE}Database setup script completed${NC}"
