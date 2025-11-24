# OMT Tournament Management System - Quick Reference

## 🚀 Quick Start

### Starting the Application
```bash
# Option 1: Use the startup script (Recommended)
start-dev.bat

# Option 2: Manual start
docker compose -f docker-compose.dev.yml up -d postgres-dev
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" next dev --turbopack
```

### Stopping the Application
```bash
# Option 1: Use the stop script
stop-dev.bat

# Option 2: Manual stop
# Press Ctrl+C to stop Next.js server
docker compose -f docker-compose.dev.yml down
```

### Checking Status
```bash
check-status.bat
```

## 📋 Application URLs

- **Development Server**: http://localhost:3001
- **Admin Login**: http://localhost:3001/admin/login
- **Application Form**: http://localhost:3001/basvuru
- **Teams Page**: http://localhost:3001/teams
- **Admin Dashboard**: http://localhost:3001/admin
- **Health Check**: http://localhost:3001/api/health

## 🔐 Default Credentials

- **Email**: admin
- **Password**: admin123

## 🗄️ Database Information

- **Type**: PostgreSQL 15
- **Container**: omt-postgres-dev
- **Database**: omt_tournament_dev
- **Port**: 5433 (host) → 5432 (container)
- **Username**: postgres
- **Password**: postgres123

## 📦 Key Technologies

- **Framework**: Next.js 15.5.6 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL via Prisma ORM
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Authentication**: Custom session-based auth

## 🛠️ Common Commands

### Database Management
```bash
# Generate Prisma Client
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" prisma generate

# Reset database and apply migrations
node node_modules\prisma\build\index.js migrate reset --force

# Run database migrations
node node_modules\prisma\build\index.js migrate deploy

# Seed database with sample data
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" tsx prisma/seed.ts

# Open Prisma Studio (Database GUI)
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" prisma studio
```

### Development
```bash
# Install dependencies
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

# Run development server
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" next dev --turbopack

# Build for production
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" next build --turbopack

# Run production server
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" next start
```

### Docker Management
```bash
# Start PostgreSQL only
docker compose -f docker-compose.dev.yml up -d postgres-dev

# Stop all containers
docker compose -f docker-compose.dev.yml down

# View logs
docker logs omt-postgres-dev

# View all running containers
docker ps
```

## 📁 Project Structure

```
omt/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Database schema definition
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── admin/           # Admin pages
│   │   ├── api/             # API routes
│   │   ├── basvuru/         # Application form page
│   │   ├── teams/           # Teams listing page
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components (Radix)
│   └── lib/                 # Utility libraries
│       ├── auth.ts          # Authentication utilities
│       ├── prisma.ts        # Prisma client instance
│       └── utils.ts         # Helper functions
├── public/
│   └── uploads/             # Uploaded files (logos, etc.)
├── .env                      # Environment variables
├── docker-compose.dev.yml    # Docker configuration
├── start-dev.bat            # Quick start script
├── stop-dev.bat             # Quick stop script
└── check-status.bat         # Status check script
```

## 🎯 Features

### For Administrators
- ✅ Secure admin login
- ✅ View all team applications
- ✅ Approve/Reject applications
- ✅ Manage users
- ✅ View team details
- ✅ Filter and search applications
- ✅ Export data to Excel

### For Teams
- ✅ Submit tournament application
- ✅ Upload team logo
- ✅ Select multiple age groups
- ✅ Specify team counts per age group
- ✅ Choose tournament stage
- ✅ Add social media links

## 🔧 Configuration Files

- **Environment**: `.env`
- **Next.js**: `next.config.ts`
- **TypeScript**: `tsconfig.json`
- **Tailwind CSS**: Configured in `src/app/globals.css`
- **PostCSS**: `postcss.config.mjs`
- **Prisma**: `prisma/schema.prisma`

## 📊 Sample Data

The database is pre-seeded with 5 sample teams:
1. Galatasaray Futbol Akademisi
2. Fenerbahçe Spor Kulübü
3. Beşiktaş Jimnastik Kulübü
4. Trabzonspor Kulübü
5. Başakşehir FK

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
docker ps | findstr omt-postgres-dev

# Restart PostgreSQL
docker compose -f docker-compose.dev.yml restart postgres-dev

# Check database logs
docker logs omt-postgres-dev
```

### Port Already in Use
- Port 3000 is used by another project, so the app runs on **3001**
- If 3001 is also busy, Next.js will automatically find another port

### Prisma Issues
```bash
# Regenerate Prisma Client
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" prisma generate

# Reset database completely
node node_modules\prisma\build\index.js migrate reset --force
```

## 📝 Notes

- PowerShell execution policy is restricted, so all npm commands use direct node calls
- The application uses session-based authentication stored in sessionStorage
- File uploads are stored in `public/uploads/`
- Database runs on port 5433 to avoid conflicts with other PostgreSQL instances
- Turbopack is enabled for faster development builds

## 🚧 Current Status

✅ **System is fully operational!**

- ✅ Dependencies installed
- ✅ Database running (PostgreSQL 15)
- ✅ Migrations applied
- ✅ Sample data seeded
- ✅ Development server running on port 3001
- ✅ All core features working
- ✅ Upload directory created

---

**Last Updated**: November 21, 2025
**Version**: 0.1.0
