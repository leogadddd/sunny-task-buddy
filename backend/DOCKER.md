# 🐳 Docker Setup for UpTrack Backend

## Quick Start

### Start Database

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Database

```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Reset Database (⚠️ Deletes all data)

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Database Info

- **Host**: localhost
- **Port**: 5432
- **Database**: uptrack_dev
- **User**: postgres
- **Password**: postgres

## Connection String

```
postgresql://postgres:postgres@localhost:5432/uptrack_dev?schema=public
```

## Docker Compose Files

- **`docker-compose.dev.yml`** - PostgreSQL only (for local development)
- **`docker-compose.yml`** - Full stack (PostgreSQL + Backend API)

## Full Stack with Docker

To run both database and backend in Docker:

```bash
docker-compose up -d
```

This will start:

- PostgreSQL on port 5432
- Backend API on port 4000

## Troubleshooting

### Port 5432 already in use

If you have PostgreSQL running locally:

```bash
sudo systemctl stop postgresql
# or
brew services stop postgresql
```

### Check if containers are running

```bash
docker ps
```

### Access PostgreSQL directly

```bash
docker exec -it uptrack-postgres-dev psql -U postgres -d uptrack_dev
```

### Clean everything

```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```
