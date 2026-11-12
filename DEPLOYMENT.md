# Ngotra Website - Full Setup Guide

## Table of Contents

1. [Local Development](#local-development)
2. [VPS Setup (Ubuntu 24.04)](#vps-setup-ubuntu-2404)
3. [Domain & DNS Configuration](#domain--dns-configuration)
4. [Nginx & SSL Setup](#nginx--ssl-setup)
5. [Production Deployment](#production-deployment)
6. [Maintenance](#maintenance)

---

## Local Development

### Prerequisites

- Node.js 20+ installed
- Git installed

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/NgotraOfficial/ngotra.git
cd ngotra

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates SQLite database)
npx prisma db push

# Seed the database with initial data
npx prisma db seed

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Admin Panel Access

1. Navigate to http://localhost:3000/auth/login
2. Default credentials (set in `prisma/seed.ts`):
   - Email: `admin@ngotra.site`
   - Password: `admin123`

---

## VPS Setup (Ubuntu 24.04)

### Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git wget ufw

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Clone Project

```bash
# Create application directory
sudo mkdir -p /var/www/ngotra
cd /var/www/ngotra

# Clone repository
sudo git clone https://github.com/NgotraOfficial/ngotra.git .
sudo chown -R $USER:$USER /var/www/ngotra

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (first time only)
npx prisma db seed
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs (with sudo)
```

### Start Application

```bash
# Start the application in production mode
pm2 start npm --name "ngotra" -- start --production

# Save PM2 process list
pm2 save

# View logs
pm2 logs ngotra
```

---

## Domain & DNS Configuration

### DNS Records

Configure your domain registrar (ngotra.site) with these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | Your VPS IP | 3600 |
| A | www | Your VPS IP | 3600 |

### Find Your VPS IP

```bash
# On your VPS, run:
curl ifconfig.me
```

---

## Nginx & SSL Setup

### Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ngotra
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name ngotra.site www.ngotra.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/ngotra /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d ngotra.site -d www.ngotra.site

# Follow prompts to complete verification
```

### Auto-Renew SSL

```bash
# Test automatic renewal
sudo certbot renew --dry-run

# Certbot installs automatic cron job - verify it exists
sudo systemctl list-timers | grep certbot
```

---

## Production Deployment

### Environment Variables

Create production environment file:

```bash
# Create .env.production
nano /var/www/ngotra/.env.production
```

Add these variables:

```
NODE_ENV=production
DATABASE_URL=file:/var/www/ngotra/prod.db
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://ngotra.site
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### Build for Production

```bash
cd /var/www/ngotra

# Build the application
npm run build

# Start with PM2
pm2 restart ngotra
```

### Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## Maintenance

### View Application Logs

```bash
# PM2 logs
pm2 logs ngotra

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Application

```bash
# Restart with PM2
pm2 restart ngotra

# Or reload without downtime
pm2 reload ngotra
```

### Update from GitHub

```bash
cd /var/www/ngotra

# Pull latest changes
sudo git pull origin main

# Install new dependencies
npm install --production

# Regenerate Prisma client
npx prisma generate

# Update database schema
npx prisma db push

# Rebuild application
npm run build

# Restart application
pm2 restart ngotra
```

### Database Backup

```bash
# Backup SQLite database
cp /var/www/ngotra/prod.db /var/www/ngotra/prod.db.backup.$(date +%Y%m%d)

# Backup to remote location
scp /var/www/ngotra/prod.db.backup.* user@backup-server:/backups/ngotra/
```

### Monitoring

```bash
# Check PM2 status
pm2 status

# Check memory usage
pm2 show ngotra

# Check Nginx status
sudo systemctl status nginx

# Check Node.js process
ps aux | grep node
```

### Troubleshooting

**Application not starting:**
```bash
# Check PM2 logs
pm2 logs ngotra --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill stuck process and restart
pm2 delete ngotra
pm2 start npm --name "ngotra" -- start --production
```

**SSL certificate issues:**
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

**Database errors:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Re-seed data
npx prisma db seed
```

---

## Quick Reference

### Common Commands

```bash
# Start app
pm2 start ngotra

# Stop app
pm2 stop ngotra

# Restart app
pm2 restart ngotra

# View logs
pm2 logs ngotra

# Check status
pm2 status

# Update app
cd /var/www/ngotra && git pull && npm install && npm run build && pm2 restart ngotra

# Nginx commands
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t
```

### File Locations

| File | Path |
|------|------|
| Application | /var/www/ngotra |
| Database | /var/www/ngotra/prod.db |
| Nginx config | /etc/nginx/sites-available/ngotra |
| SSL certs | /etc/letsencrypt/live/ngotra.site/ |
| PM2 logs | ~/.pm2/logs/ |
| Nginx logs | /var/log/nginx/ |

---

## Security Checklist

- [ ] UFW firewall enabled (SSH, HTTP, HTTPS only)
- [ ] SSL certificate installed and auto-renewing
- [ ] Database file permissions restricted
- [ ] Admin credentials changed from defaults
- [ ] Regular backups configured
- [ ] System updates scheduled
- [ ] Monitoring/logs reviewed regularly