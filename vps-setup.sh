#!/usr/bin/env bash

# Exit on any error
enable -e

# ------------------------------------------------------------
# Prerequisites
# ------------------------------------------------------------
# - A fresh Ubuntu/Debian VPS (root or sudo access)
# - Port 22 (SSH) open, you can connect as the sudo user.
# ------------------------------------------------------------

# 1. Update the system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install essential build tools
sudo apt-get install -y build-essential curl git

# 3. Install Node.js (using nvm for easy version management)
# If nvm is not installed, install it first:
if ! command -v nvm >/dev/null 2>&1; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # Load nvm into the current shell session
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
fi

# Install the Node version used by the project (as defined in package.json)
# Here we assume Node 20.x – adjust if you need a different version.
nvm install 20
nvm use 20

# Verify installation
node -v
npm -v

# 4. Clone the repository (skip if you already have the code on the VPS)
# Replace <repo-url> with the HTTPS URL of your repo.
# git clone <repo-url> ngotra
# cd ngotra

# If the code is already present, just ensure we are in the project directory:
cd "$(dirname "$0")"

# 5. Install project dependencies
npm ci

# 6. Set up environment variables
# Copy the example env file and edit as needed.
if [ -f .env.example ]; then
  cp .env.example .env
  echo "# Edit .env with your production values (DATABASE_URL, JWT_SECRET, etc.)"
else
  echo "Warning: .env.example not found – you may need to create a .env file manually."
fi

# 7. Run Prisma migrations (or generate the client if you use a fresh DB)
# Ensure the DATABASE_URL in .env points to a reachable SQLite, PostgreSQL, etc.
# The following will apply migrations and generate the Prisma client.
npm run postinstall || true

# 8. Build the Next.js application (optional for production)
npm run build

# 9. Start the app in the background (using pm2 for resilience – install if missing)
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
pm2 start npm --name "ngotra" -- run start
pm2 save

# 10. (Optional) Set up a reverse proxy (nginx) – example snippet
# sudo apt-get install -y nginx
# sudo tee /etc/nginx/sites-available/ngotra <<'EOF'
# server {
#   listen 80;
#   server_name your-domain.com;
#   location / {
#     proxy_pass http://localhost:3000; # default Next.js port
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade "$http_upgrade";
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
#   }
# }
# EOF
# sudo ln -s /etc/nginx/sites-available/ngotra /etc/nginx/sites-enabled/
# sudo systemctl restart nginx

# ------------------------------------------------------------
# Finished! Your Next.js app should now be running and accessible.
# Use 'pm2 status' to check the process, and 'pm2 logs ngotra' for logs.
# ------------------------------------------------------------
