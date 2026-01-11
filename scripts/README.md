# 🚀 MantleForge Setup Scripts

## ⚠️ IMPORTANT FOR SHARED SERVERS

All scripts are designed to be **safe for shared servers**. They:
- ✅ Check for existing services before installing
- ✅ Use project-specific directories
- ✅ Don't modify system-wide configurations
- ✅ Ask for confirmation before making changes
- ✅ Use isolated environments (venv, nvm)

---

## Available Scripts

### `check-server.sh` ⭐ **RUN THIS FIRST**
Checks your server environment before setup.

**Usage:**
```bash
./scripts/check-server.sh
```

**What it shows:**
- Node.js version and location
- Python version and venv availability
- PM2 installation and running apps
- Port 3000 and 5000 status
- Firewall configuration
- Project structure
- Environment files

**When to run:**
- Before running setup-hetzner.sh
- To verify your server environment
- To check for conflicts

---

### `setup-local.sh`
Sets up the complete development environment locally.

**Usage:**
```bash
./scripts/setup-local.sh
```

**What it does:**
- Installs all npm dependencies (contracts, backend, frontend)
- Sets up Python virtual environment
- Installs Python dependencies
- Verifies Node.js version
- Uses nvm if available

**Safe to run:** ✅ Yes, only affects project directory

---

### `setup-hetzner.sh` ⚠️ **SHARED SERVER SAFE**
Sets up the complete production environment on Hetzner server.

**Usage:**
```bash
# On your Hetzner server
cd /path/to/novamantle
./scripts/check-server.sh  # Run this first!
./scripts/setup-hetzner.sh
```

**What it does:**
- Checks for existing services on ports 3000 and 5000
- Asks for confirmation if ports are in use
- Checks for existing Node.js/Python installations
- Uses nvm for Node.js 20 (isolated)
- Sets up Python venv (isolated)
- Installs dependencies
- Configures PM2 (checks for existing installation)
- Creates logs directories
- Checks firewall (doesn't modify automatically)

**Safety features:**
- ✅ Checks ports before using them
- ✅ Asks for confirmation if conflicts detected
- ✅ Uses project-specific paths
- ✅ Doesn't modify system-wide configs
- ✅ Doesn't break existing services
- ✅ PM2 apps use namespace 'mantle-forge'

**What it WON'T do:**
- ❌ Won't modify firewall automatically (to avoid breaking other services)
- ❌ Won't install system packages without checking first
- ❌ Won't overwrite existing configurations

---

### `deploy-contracts.sh`
Deploys smart contracts to Mantle network.

**Usage:**
```bash
# Deploy to testnet
./scripts/deploy-contracts.sh testnet

# Deploy to mainnet
./scripts/deploy-contracts.sh mainnet
```

**What it does:**
- Checks for .env file
- Validates private key
- Deploys to specified network
- Provides next steps

**Requirements:**
- `.env` file in `contracts/` directory
- `PRIVATE_KEY` set in .env
- Wallet funded with MNT

---

## Shared Server Considerations

### Port Conflicts
If ports 3000 or 5000 are in use:
1. The script will warn you
2. You can change ports in `.env` files:
   - `backend/.env`: `PORT=3001` (or any available port)
   - `python-saas/.env`: `PORT=5001` (or any available port)
3. Update `ecosystem.config.js` if needed

### PM2 App Name Conflicts
If you have existing PM2 apps with same names:
1. The script uses namespace 'mantle-forge'
2. App names: 'mantle-forge-backend' and 'mantle-forge-python-saas'
3. If conflicts, you can rename in `ecosystem.config.js`

### Existing Node.js/Python
- Script checks for existing installations
- Uses them if version is sufficient
- Falls back to nvm/venv if needed
- Won't break existing installations

### Firewall
- Script checks firewall status
- Shows which ports are allowed
- **Doesn't modify firewall automatically** (to avoid breaking other services)
- You can manually allow ports: `sudo ufw allow 3000/tcp`

---

## Troubleshooting

### Script fails with "command not found"
Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Port already in use
1. Check what's using it: `lsof -i :3000`
2. Change port in `.env` file
3. Update `ecosystem.config.js` if needed

### PM2 conflicts
1. Check existing apps: `pm2 list`
2. Rename apps in `ecosystem.config.js` if needed
3. Use PM2 namespaces to isolate

### Python venv issues
Install python3-venv:
```bash
sudo apt install python3.10-venv
```

### Node.js version issues
Use nvm to manage versions:
```bash
nvm install 20
nvm use 20
```

---

## Best Practices for Shared Servers

1. **Always run `check-server.sh` first**
2. **Verify ports are available** before setup
3. **Check PM2 app names** don't conflict
4. **Use different ports** if needed (change in .env)
5. **Test in development** before production
6. **Monitor logs** after starting services

---

*All scripts are designed to be idempotent - safe to run multiple times.*
