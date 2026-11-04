# Technical Architecture & EC2 Topology Blueprint
## Project: ASTERISK (`*`)
**Infrastructure Topology, Docker Containerization, Nginx Reverse Proxy, & AWS EC2 Runbook**

| Metadata | Detail |
| :--- | :--- |
| **Document Version** | 1.0.0 |
| **Target Cloud Provider** | Amazon Web Services (AWS EC2) |
| **Recommended EC2 Sizing** | `t4g.small` (ARM64 / Graviton2) atau `t3.small` (x86_64) |
| **Operating System** | Ubuntu 24.04 LTS |
| **Container Engine** | Docker Engine + Docker Compose V2 |
| **Web Server / Ingress** | Nginx Reverse Proxy + Let's Encrypt SSL (Certbot) |

---

## 1. High-Level Infrastructure Topology

Diagram berikut menggambarkan alur lalu lintas data dari browser pengguna menuju ke instance AWS EC2 hingga ke database internal:

```mermaid
flowchart TD
    CLIENT["Browser Pengguna\n(Superadmin / Dev / QA)"] -->|HTTPS :443| CF["DNS / Domain Provider\n(e.g., Cloudflare / Route 53)"]
    
    subgraph EC2["AWS EC2 Instance (VPC / Security Group)"]
        CF -->|Allow Ports 80 & 443| NGINX["Nginx Reverse Proxy & SSL\n(Docker Container: asterisk-proxy)"]
        
        subgraph InternalNetwork["Docker Bridge Network: asterisk-net"]
            NGINX -->|Proxy /api/*\nHTTP :3000| ELYSIA["Backend API Service\n(Bun + ElysiaJS: asterisk-backend)"]
            NGINX -->|Proxy /* (Frontend)\nHTTP :4321| ASTRO["Frontend SSR Service\n(Astro TS + React: asterisk-frontend)"]
            
            ELYSIA -->|Drizzle ORM\nTCP :5432| PGSQL[("PostgreSQL 16 Database\n(Volume Mount: asterisk-db)")]
        end

        CRON["Systemd / Cron Job\n(Daily Backup Script)"] -.->|pg_dump| PGSQL
        CRON -.->|Archive DB| LOCAL_BACKUP["/var/backups/asterisk/\n(or AWS S3 Bucket)"]
    end
```

---

## 2. Pemilihan & Optimasi Biaya EC2 (AWS Credits)

Karena kamu memiliki kredit AWS, kita rancang spesifikasi yang **paling hemat biaya namun memiliki performa tinggi**:

### 2.1 Rekomendasi Tipe Instance
- **Pilihan Utama: `t4g.small` (2 vCPU, 2 GB RAM, ARM64 Graviton2)**:
  - **Alasan:** Biayanya ~20% lebih murah daripada seri x86 `t3.small`, dan runtime **Bun** memiliki optimasi native yang luar biasa di arsitektur ARM64 Linux.
  - RAM 2 GB sangat cukup untuk menjalankan:
    - Docker Nginx (~20 MB)
    - Bun + ElysiaJS (~40-60 MB)
    - Astro SSR Node/Bun runtime (~80-120 MB)
    - PostgreSQL 16 Alpine (~150-250 MB)
    - Sisa RAM (~1.5 GB) dialokasikan untuk buffer cache OS Linux.
- **Alternatif:** `t3.small` (2 vCPU, 2 GB RAM, Intel/AMD x86_64) jika kamu lebih memilih image x86 standar.

### 2.2 Konfigurasi Storage & Security Group

#### AWS EBS Storage:
- **Volume Type:** `gp3` (General Purpose SSD).
- **Size:** 25 GB – 30 GB (Cukup untuk OS, Docker images, log audit, dan snapshot database hingga bertahun-tahun).

#### AWS Security Group (Inbound Rules):
| Type | Port | Source | Deskripsi |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | My IP Only (IP kamu) | Akses remote server yang aman (jangan dibuka `0.0.0.0/0`) |
| **HTTP** | `80` | `0.0.0.0/0` | Redirect otomatis ke HTTPS oleh Nginx & validasi Certbot |
| **HTTPS** | `443` | `0.0.0.0/0` | Lalu lintas aman terenkripsi SSL untuk pengguna Asterisk |
| **PostgreSQL** | `5432` | **DENY / TIDAK DIBUKA KE PUBLIK** | Port database hanya boleh diakses antar kontainer Docker internal |

---

## 3. Docker Containerization Architecture

Seluruh komponen Asterisk berjalan dalam kontainer terisolasi yang dihubungkan melalui satu private bridge network: `asterisk-net`.

### 3.1 Blue-print `docker-compose.yml`

```yaml
version: '3.8'

networks:
  asterisk-net:
    driver: bridge

volumes:
  pgdata:
    driver: local
  certbot-etc:
    driver: local
  certbot-var:
    driver: local

services:
  # 1. Database PostgreSQL
  asterisk-db:
    image: postgres:16-alpine
    container_name: asterisk-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-asterisk_db}
      POSTGRES_USER: ${POSTGRES_USER:-asterisk_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - asterisk-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-asterisk_admin} -d ${POSTGRES_DB:-asterisk_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Backend ElysiaJS (Bun)
  asterisk-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: asterisk-backend
    restart: unless-stopped
    environment:
      PORT: 3000
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-asterisk_admin}:${POSTGRES_PASSWORD}@asterisk-db:5432/${POSTGRES_DB:-asterisk_db}
      MASTER_ENCRYPTION_KEY: ${MASTER_ENCRYPTION_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      asterisk-db:
        condition: service_healthy
    networks:
      - asterisk-net

  # 3. Frontend Astro SSR (TypeScript)
  asterisk-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: asterisk-frontend
    restart: unless-stopped
    environment:
      HOST: 0.0.0.0
      PORT: 4321
      PUBLIC_API_URL: https://${DOMAIN_NAME}/api
      INTERNAL_BACKEND_URL: http://asterisk-backend:3000
    depends_on:
      - asterisk-backend
    networks:
      - asterisk-net

  # 4. Ingress Reverse Proxy & SSL (Nginx)
  asterisk-proxy:
    image: nginx:alpine
    container_name: asterisk-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot-etc:/etc/letsencrypt:ro
      - certbot-var:/var/lib/letsencrypt:ro
      - ./nginx/certbot-challenge:/var/www/certbot:ro
    depends_on:
      - asterisk-frontend
      - asterisk-backend
    networks:
      - asterisk-net
```

---

## 4. Konfigurasi Nginx Reverse Proxy & SSL

Berikut template konfigurasi Nginx untuk menangani routing frontend, backend, WebSocket, serta *security headers*:

```nginx
# /etc/nginx/conf.d/asterisk.conf

upstream frontend_upstream {
    server asterisk-frontend:4321;
}

upstream backend_upstream {
    server asterisk-backend:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name asterisk.reycannavaro.dev;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Main HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name asterisk.reycannavaro.dev;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/asterisk.reycannavaro.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/asterisk.reycannavaro.dev/privkey.pem;

    # SSL Hardening Protocols
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 1. Backend API Routing
    location /api/ {
        proxy_pass http://backend_upstream/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings untuk operasi panjang
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 2. Frontend Astro SSR Routing
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Manajemen Secrets & Environment Variables EC2

File konfigurasi sensitif `.env` pada server EC2 disimpan di root direktori project server (`/opt/asterisk/.env`) dengan hak akses terbatas (`chmod 600 .env`):

```env
# --- ENVIRONMENT EC2 PRODUCTION ---
DOMAIN_NAME=asterisk.reycannavaro.dev
NODE_ENV=production

# --- DATABASE CREDENTIALS ---
POSTGRES_DB=asterisk_production
POSTGRES_USER=asterisk_superadmin
POSTGRES_PASSWORD=generate_super_strong_password_here_123!

# --- MASTER ENCRYPTION KEY (AES-256-GCM) ---
# Generate via: openssl rand -hex 32
MASTER_ENCRYPTION_KEY=e83a48bf56d39fa28...64_hex_chars_total...

# --- AUTH & SESSION SECRET ---
# Generate via: openssl rand -base64 48
JWT_SECRET=super_secret_jwt_sign_key_here...
```

---

## 6. Disaster Recovery & Automated Database Backup

Untuk menjamin data feedback showing klien dan brankas kredensial tidak pernah hilang saat server bermasalah, dipasang cron script otomatis:

### 6.1 Script Backup Harian (`/opt/asterisk/scripts/backup-db.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/asterisk"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="asterisk_db_backup_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

# Eksekusi pg_dump dari dalam container database
docker exec -t asterisk-db pg_dump -U asterisk_superadmin asterisk_production | gzip > "$BACKUP_DIR/$FILENAME"

# Hapus backup yang lebih tua dari 14 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -delete

echo "[$DATE] Backup successfully created: $FILENAME"
```

### 6.2 Registrasi Crontab
Jalankan setiap hari jam 02:00 pagi:
```bash
0 2 * * * /bin/bash /opt/asterisk/scripts/backup-db.sh >> /var/log/asterisk_backup.log 2>&1
```

---

## 7. Deployment Runbook (Panduan Deploy ke EC2)

Langkah demi langkah saat pertama kali men-deploy Asterisk ke AWS EC2:

1. **Persiapan Instance EC2**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose-v2 git curl certbot
   sudo systemctl enable --now docker
   sudo usermod -aG docker ubuntu
   ```

2. **Clone Repository & Setup Direktori**:
   ```bash
   sudo mkdir -p /opt/asterisk
   sudo chown -R ubuntu:ubuntu /opt/asterisk
   cd /opt/asterisk
   git clone <repo_github_asterisk> .
   cp .env.example .env
   nano .env # Masukkan master key dan password database
   ```

3. **Generate Sertifikat SSL Let's Encrypt**:
   ```bash
   sudo certbot certonly --standalone -d asterisk.reycannavaro.dev
   ```

4. **Jalankan Aplikasi dengan Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

5. **Pembaruan Aplikasi Berkala (Rolling Update)**:
   ```bash
   git pull origin main
   docker compose up -d --build --no-deps asterisk-backend asterisk-frontend
   ```

---

---

## 8. Monorepo Workspace & Task Runner Specification (`moonrepo`)

Untuk menyatukan frontend (Astro TS) dan backend (ElysiaJS Bun) dalam satu repository (*monorepo*) yang bersih, cepat, dan memiliki alur kerja konsisten, Asterisk menggunakan **`moon` (moonrepo)** sebagai *orchestration engine*.

### 8.1 Alokasi Port Lokal (Local Development Ports)

| Service | Framework / Engine | Port Lokal | Command Dev | Keterangan |
| :--- | :--- | :---: | :--- | :--- |
| **Frontend** | Astro TS + React Islands | `:4321` | `moon run frontend:dev` | Web Dashboard Asterisk |
| **Backend** | ElysiaJS (Bun Runtime) | `:3000` | `moon run backend:dev` | REST API & Swagger (`/swagger`) |
| **Database** | PostgreSQL 16 (Docker) | `:5432` | `docker compose up -d asterisk-db` | Database server relasional |
| **DB GUI** | Drizzle Studio | `:4983` | `moon run backend:db:studio` | Visual GUI inspect & edit data DB |

---

### 8.2 Daftar Perintah Utama (`moon run <target>`)

Semua operasi pengembangan dijalankan melalui perintah `moon`:

```bash
# =======================================================
# 🚀 DEVELOPMENT WORKFLOW
# =======================================================
# Menjalankan server backend Elysia (Bun watch mode) di port 3000:
moon run backend:dev

# Menjalankan server frontend Astro (HMR active) di port 4321:
moon run frontend:dev

# Menjalankan kedua service sekaligus secara paralel:
moon run :dev

# =======================================================
# 🗄️ DATABASE OPERATIONS (Drizzle ORM)
# =======================================================
# Generate migrasi SQL baru dari skema TypeScript:
moon run backend:db:generate

# Eksekusi migrasi ke database PostgreSQL:
moon run backend:db:migrate

# Membuka Drizzle Studio GUI di port 4983:
moon run backend:db:studio

# Menjalankan seeder awal (Superadmin Rey & default permissions):
moon run backend:db:seed

# =======================================================
# 📦 BUILD & VERIFICATION
# =======================================================
# Build production untuk backend dan frontend secara paralel:
moon run :build

# Validasi type-safety TypeScript di seluruh workspace:
moon run :typecheck

# Format & Linting kode:
moon run :lint
```

---

### 8.3 Spesifikasi Konfigurasi Moonrepo

#### 1. Root Workspace Configuration (`.moon/workspace.yml`)
```yaml
# https://moonrepo.dev/docs/config/workspace
projects:
  backend: 'backend'
  frontend: 'frontend'

vcs:
  manager: 'git'
  defaultBranch: 'main'
```

#### 2. Toolchain Configuration (`.moon/toolchain.yml`)
```yaml
# https://moonrepo.dev/docs/config/toolchain
node:
  version: '20.18.0'
  packageManager: 'bun'

bun:
  version: '1.1.30'
```

#### 3. Backend Task Blueprint (`backend/moon.yml`)
```yaml
type: 'application'
language: 'typescript'

tasks:
  dev:
    command: 'bun --watch src/index.ts'
    local: true
    options:
      env:
        PORT: '3000'

  build:
    command: 'bun build src/index.ts --outdir dist --target bun'
    inputs:
      - 'src/**/*'

  db:generate:
    command: 'bun x drizzle-kit generate'
    local: true

  db:migrate:
    command: 'bun run src/db/migrate.ts'
    local: true

  db:studio:
    command: 'bun x drizzle-kit studio --port 4983'
    local: true

  typecheck:
    command: 'bun x tsc --noEmit'
    inputs:
      - 'src/**/*'
```

#### 4. Frontend Task Blueprint (`frontend/moon.yml`)
```yaml
type: 'application'
language: 'typescript'

tasks:
  dev:
    command: 'astro dev --port 4321 --host 0.0.0.0'
    local: true

  build:
    command: 'astro build'
    inputs:
      - 'src/**/*'
      - 'public/**/*'

  preview:
    command: 'astro preview --port 4321'
    local: true

  typecheck:
    command: 'astro check'
    inputs:
      - 'src/**/*'
```

---

## 9. Summary Status Dokumentasi Proyek

Dengan selesainya dokumen ini, seluruh **Foundational Architecture Blueprint** telah 100% lengkap:
- [x] [PRD & Scope Boundary](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/PRD.md)
- [x] [RBAC Matrix & Security Specification](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/02-RBAC-and-Security-Spec.md)
- [x] [Database Design & ERD](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/03-Database-Design-and-ERD.md)
- [x] [Technical Architecture & EC2 Topology Blueprint](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/04-Architecture-and-Deployment.md)
- [x] [API Contract & Eden Schema](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/05-API-Contract-and-Eden-Schema.md)
- [x] [Interactive User Flow & Wireframes](file:///c:/Users/Rey%20Cannavaro/asterisk/docs/06-User-Flow-and-Wireframes.md)
