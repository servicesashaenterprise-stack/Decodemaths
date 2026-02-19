# DECODE MATHS - Deployment Guide

## 🚀 Deployment Options

### Option 1: Continue Using Emergent Hosting (Recommended for Quick Start)
Your application is currently live on Emergent's infrastructure:
- **URL**: https://qbank-decode.preview.emergentagent.com
- **Advantages**: Zero setup, automatic scaling, maintained infrastructure
- **Note**: Check with Emergent support about production hosting plans

### Option 2: Deploy to Your Own Hosting

## 📋 Prerequisites for Self-Hosting

- **Server**: VPS or cloud instance (AWS, DigitalOcean, Azure, etc.)
- **Node.js**: v18+ installed
- **Python**: 3.11+ installed
- **MongoDB**: Database (MongoDB Atlas or self-hosted)
- **Domain**: Your custom domain (optional)

## 🛠️ Deployment Steps for Self-Hosting

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install MongoDB (if self-hosting database)
# OR use MongoDB Atlas (recommended): https://www.mongodb.com/cloud/atlas
```

### Step 2: Clone Your Application

```bash
# Upload your code to server (via git, scp, or ftp)
git clone <your-repo-url>
cd math-question-bank

# Or download from Emergent
# (Contact support for code export options)
```

### Step 3: Configure Environment Variables

**Backend (.env file):**
```bash
cd backend
cat > .env << 'EOF'
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

DB_NAME=decode_maths_prod

# CORS Origins (your frontend URL)
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000

# Server Configuration
PORT=8001
HOST=0.0.0.0
EOF
```

**Frontend (.env file):**
```bash
cd ../frontend
cat > .env << 'EOF'
# Backend API URL
REACT_APP_BACKEND_URL=https://api.yourdomain.com
# OR if backend on same server:
# REACT_APP_BACKEND_URL=http://localhost:8001
EOF
```

### Step 4: Install Dependencies

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
# or
yarn install
```

### Step 5: Seed Database

```bash
cd backend
source venv/bin/activate
python ../scripts/seed_data.py
```

### Step 6: Build Frontend

```bash
cd frontend
npm run build
# or
yarn build

# This creates a production build in /frontend/build
```

### Step 7: Run with Production Server

**Option A: Using PM2 (Recommended)**

```bash
# Install PM2
sudo npm install -g pm2

# Start Backend
cd backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name decode-maths-backend

# Serve Frontend with PM2 and serve package
sudo npm install -g serve
cd ../frontend
pm2 start "serve -s build -l 3000" --name decode-maths-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

**Option B: Using Systemd Services**

Create backend service:
```bash
sudo nano /etc/systemd/system/decode-maths-backend.service
```

Add:
```ini
[Unit]
Description=DECODE MATHS Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable decode-maths-backend
sudo systemctl start decode-maths-backend
```

### Step 8: Configure Nginx (Reverse Proxy)

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/decode-maths
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/decode-maths /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Step 10: Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🐳 Docker Deployment (Alternative)

**Dockerfile for Backend:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Dockerfile for Frontend:**
```dockerfile
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=decode_maths
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Run with Docker:
```bash
docker-compose up -d
```

## 📊 Monitoring & Maintenance

```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# MongoDB backup
mongodump --uri="mongodb://localhost:27017/decode_maths_prod" --out=/backup/$(date +%Y%m%d)

# Update application
git pull
cd backend && pip install -r requirements.txt
cd ../frontend && npm install && npm run build
pm2 restart all
```

## 🔒 Security Checklist

- ✅ Use strong admin password (not admin123 in production!)
- ✅ Enable HTTPS with SSL certificate
- ✅ Configure MongoDB authentication
- ✅ Set up firewall rules
- ✅ Regular security updates: `sudo apt update && sudo apt upgrade`
- ✅ Enable rate limiting in Nginx
- ✅ Regular database backups
- ✅ Use environment variables (never commit .env files)

## 📞 Support

For deployment assistance:
- Emergent Support (if using Emergent hosting)
- Your hosting provider's documentation
- MongoDB Atlas support (if using)

## 🎯 Production Checklist

Before going live:
- [ ] Update admin credentials
- [ ] Configure proper MongoDB connection
- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update CORS origins
- [ ] Test payment integrations (if any)
- [ ] Review security settings
