# 🚀 Quick Start Guide

## Start All Services

```bash
npm run start
```

Or directly:
```bash
./scripts/start-all.sh
```

## Stop All Services

```bash
npm run kill
```

Or:
```bash
./scripts/kill-all.sh
```

## Services

1. **Python SaaS** (Port 5000)
   - PDF analysis endpoint
   - URL: http://localhost:5000/api/analyze

2. **Backend** (Port 3000)
   - Agent orchestration
   - URL: http://localhost:3000

3. **Frontend** (Port 5173)
   - User interface
   - URL: http://localhost:5173

## Check Status

```bash
# Python SaaS
curl http://localhost:5000/api/health

# Backend
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:5173
```

## View Logs

```bash
# Python SaaS
tail -f /tmp/python-saas.log

# Backend
tail -f /tmp/backend.log

# Frontend
tail -f /tmp/frontend.log
```

## Individual Services

Start individually:

```bash
# Python SaaS
cd python-saas && python3 app.py

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## Tests

```bash
npm test
```

