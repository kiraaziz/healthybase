# 🛡️ Healthy Base — Automated PostgreSQL Backup Manager

> Code in flow, Healthy Base got your back-up.

Healthy Base is an open-source, self-hostable PostgreSQL backup manager. Create backups automatically on a schedule or instantly on demand. Restore, download, or mount any backup — all from a clean dashboard.

![Demo](https://healthybase.cloud/image/demo.png)

---

## ✨ Features

- 🔄 **Automated Backups** — Schedule hourly or daily backups via built-in cron jobs
- ⚡ **On-Demand Backups** — Trigger a backup instantly with one click
- 🔐 **Encrypted Storage** — All backups are encrypted and stored in MinIO (S3-compatible)
- 📦 **Versioned** — Keep multiple backup versions per project
- 🔁 **Restore & Mount** — Restore any version directly to your database, or mount it to inspect the data
- ⬇️ **Download** — Download any backup file at any time
- 📧 **Email Alerts** — Get notified on backup success, failure, or storage warnings
- 📊 **Dashboard & Logs** — Full visibility into every job and its status

---

## 🚀 Self-Host with Docker

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose

---

### ⚡ Option 1 — One command install (recommended)

No need to clone the repo. Just run:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/kiraaziz/healthybase/main/docker-compose.yml && docker compose up -d
```

This pulls the latest image from Docker Hub and starts everything automatically.

---

### 🛠️ Option 2 — Clone and build from source

```bash
git clone https://github.com/kiraaziz/healthybase.git
cd healthybase
docker compose up -d --build
```

---

### Open the app

<!-- Use HTML for table so GitHub renders columns correctly -->
<table>
  <thead>
    <tr>
      <th>Service</th>
      <th>URL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>App</td>
      <td><a href="http://localhost:3000">http://localhost:3000</a></td>
    </tr>
    <tr>
      <td>MinIO Console</td>
      <td><a href="http://localhost:9001">http://localhost:9001</a></td>
    </tr>
    <tr>
      <td>Mailpit (dev email)</td>
      <td><a href="http://localhost:8025">http://localhost:8025</a></td>
    </tr>
  </tbody>
</table>

All services start automatically with sensible defaults — no configuration required to get started.

---

## 🔧 Environment Variables

All variables have defaults and work out of the box. To customize, create a `.env` file:

```bash
cp .env.example .env
```

<details>
  <summary><strong>Click to view .env example</strong></summary>

```properties
APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

AUTH_SECRET=              # generate: openssl rand -base64 32
JOB_KEY=                  # generate: openssl rand -hex 32
ENTERPRISE_EMAIL=

# Postgres
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB

# MinIO
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=

# SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```
</details>

---

## 🧱 Tech Stack

<!-- Use HTML for table rendering -->
<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Framework</td>
      <td><a href="https://nextjs.org/">Next.js 15</a> (App Router)</td>
    </tr>
    <tr>
      <td>Database</td>
      <td><a href="https://www.postgresql.org/">PostgreSQL 17</a> + <a href="https://www.prisma.io/">Prisma ORM</a></td>
    </tr>
    <tr>
      <td>Storage</td>
      <td><a href="https://min.io/">MinIO</a> (S3-compatible)</td>
    </tr>
    <tr>
      <td>Auth</td>
      <td><a href="https://next-auth.js.org/">NextAuth.js</a></td>
    </tr>
    <tr>
      <td>Email</td>
      <td>SMTP (dev: <a href="https://mailpit.axllent.org/">Mailpit</a>)</td>
    </tr>
    <tr>
      <td>Cron</td>
      <td>Node.js cron worker (<code>server/job.js</code>)</td>
    </tr>
    <tr>
      <td>Backup</td>
      <td><code>pg_dump</code> / <code>pg_restore</code></td>
    </tr>
  </tbody>
</table>

---

## 📜 Available Scripts

<table>
  <thead>
    <tr>
      <th>Script</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm run dev</code></td>
      <td>Start Next.js in dev mode</td>
    </tr>
    <tr>
      <td><code>npm run dev:all</code></td>
      <td>Start Next.js + cron worker together</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>Build for production</td>
    </tr>
    <tr>
      <td><code>npm run start:all</code></td>
      <td>Start production app + cron worker</td>
    </tr>
    <tr>
      <td><code>npm run db:generate</code></td>
      <td>Create a new Prisma migration</td>
    </tr>
    <tr>
      <td><code>npm run db:migrate</code></td>
      <td>Apply migrations (production)</td>
    </tr>
    <tr>
      <td><code>npm run db:push</code></td>
      <td>Push schema changes without migration</td>
    </tr>
    <tr>
      <td><code>npm run db:studio</code></td>
      <td>Open Prisma Studio</td>
    </tr>
  </tbody>
</table>

---

## 🏗️ Architecture

<!-- Use a code block with `text` language so diagram renders monospace -->

```text
┌─────────────────────────────────────────────┐
│                Docker Network               │
│                                             │
│  ┌─────────┐   ┌──────────┐   ┌─────────┐  │
│  │ Next.js │   │ Postgres │   │  MinIO  │  │
│  │  :3000  │──▶│  :5432   │   │  :9000  │  │
│  │  + cron │   └──────────┘   └─────────┘  │
│  └─────────┘                               │
│       │         ┌──────────┐               │
│       └────────▶│ Mailpit  │               │
│                 │  :1025   │                │
│                 └──────────┘                │
└─────────────────────────────────────────────┘
```

---

## 📄 License

This project is free to use, modify, and self-host under the following condition:

> **You must keep the "Powered by [Healthy Base](https://healthybase.cloud)" attribution visible in your deployment's UI.**

Removing or hiding the attribution without written permission from [@kiraaziz](https://github.com/kiraaziz) is not allowed.
```

Also create a `LICENSE` file in your repo root:
```
Custom Attribution License

Copyright (c) 2026 kiraaziz (https://github.com/kiraaziz)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, and distribute it, subject to
the following conditions:

1. ATTRIBUTION REQUIRED: Any deployment, fork, or modified version of this
   software must display a visible "Powered by Healthy Base" notice linking
   to https://healthybase.cloud in the user interface.

2. The attribution must be clearly visible to end users and must not be
   hidden, removed, or obscured in any way.

3. Commercial use is permitted provided the attribution requirement above
   is met.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
---

## 🌐 Hosted Version

Don't want to self-host? Try the managed version at **[healthybase.cloud](https://healthybase.cloud)** — free tier available.

