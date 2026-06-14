#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
cd /home/zaman/yohto-cleaning-service/client

# Local production runs need to reach the Express API on this machine.
export API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:5000}"
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:5000}"

# Stop a leftover next start so rebuild + restart works in one command.
if command -v lsof >/dev/null 2>&1; then
  OLD_PIDS=$(lsof -ti :3000 -sTCP:LISTEN 2>/dev/null)
  if [ -n "$OLD_PIDS" ]; then
    echo "Stopping existing process on port 3000..."
    kill $OLD_PIDS 2>/dev/null
    sleep 1
  fi
fi

npm run start
