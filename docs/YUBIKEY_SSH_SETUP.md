# YubiKey SSH Setup Guide

Complete guide for using one YubiKey SSH key across GitHub, Replit, and Cursor.

## Prerequisites

- YubiKey with PIV support (YubiKey 5 series)
- OpenSC installed (Windows: `winget install OpenSC.OpenSC`)
- SSH key already on YubiKey slot 9a (Authentication)

## Step 1: Export Your Public Key (One Time)

If you haven't already exported your SSH public key from the YubiKey:

```powershell
# Export from YubiKey PIV slot 9a
ykman piv keys export 9a pubkey.pem

# Convert to SSH format
ssh-keygen -f pubkey.pem -i -m PKCS8 > yubikey.pub

# View the key (copy this for GitHub/Replit)
cat yubikey.pub
```

**Save `yubikey.pub` somewhere permanent** - you'll add this same key to every service.

## Step 2: SSH Config (Windows)

Create/edit `%USERPROFILE%\.ssh\config`:

```
# -------------------------------------------------
# Global: Use YubiKey for all SSH connections
# -------------------------------------------------
Host *
    PKCS11Provider "C:\Program Files\OpenSC Project\OpenSC\pkcs11\opensc-pkcs11.dll"
    IdentitiesOnly yes
    AddKeysToAgent yes
    LogLevel INFO

# -------------------------------------------------
# GitHub
# -------------------------------------------------
Host github.com
    HostName github.com
    User git

# -------------------------------------------------
# Replit (update with your actual repl details)
# -------------------------------------------------
Host replit-nexus
    HostName <your-repl-id>.replit.dev
    User <your-username>
    Port <port-from-replit-ssh-pane>

# -------------------------------------------------
# Add more hosts as needed
# -------------------------------------------------
```

## Step 3: Add Key to Services

### GitHub
1. Go to [github.com/settings/keys](https://github.com/settings/keys)
2. Click **New SSH key**
3. Paste contents of `yubikey.pub`
4. Save

Test: `ssh -T git@github.com` (enter YubiKey PIN)

### Replit
1. Open your Repl
2. Open **SSH pane** (bottom right)
3. Go to **Keys** tab
4. Click **Add Key**
5. Paste contents of `yubikey.pub`
6. Copy the connection details to update your SSH config

Test: `ssh replit-nexus` (enter YubiKey PIN)

### Cursor/VS Code
1. Install **Remote - SSH** extension
2. `Ctrl+Shift+P` → **Remote-SSH: Connect to Host**
3. Select `replit-nexus` (or add new from config)
4. Enter YubiKey PIN when prompted

## Troubleshooting

### "No such identity" or key not found
```powershell
# Check if OpenSC sees your YubiKey
& "C:\Program Files\OpenSC Project\OpenSC\tools\pkcs11-tool.exe" --module "C:\Program Files\OpenSC Project\OpenSC\pkcs11\opensc-pkcs11.dll" -L
```

### Verbose SSH debugging
```powershell
ssh -vvv -T git@github.com
```

### PIN prompt not appearing
- Ensure YubiKey is inserted
- Try removing and reinserting
- Check if another process has a lock on it

### "Permission denied (publickey)"
1. Verify the public key is added to the service
2. Check SSH config path is correct
3. Run `ssh-add -L` to see if agent has the key loaded

### Multiple YubiKeys
If you have multiple YubiKeys, ensure the correct one is inserted. Each YubiKey has a unique key pair.

## Using ssh-agent (Alternative Method)

Instead of `PKCS11Provider` in config, you can load the key into ssh-agent:

```powershell
# Start ssh-agent if not running
Start-Service ssh-agent

# Add YubiKey to agent
ssh-add -s "C:\Program Files\OpenSC Project\OpenSC\pkcs11\opensc-pkcs11.dll"

# List loaded keys
ssh-add -L
```

Then remove `PKCS11Provider` lines from SSH config - the agent provides the key.

## Quick Reference

| Service | Where to add key | Test command |
|---------|------------------|--------------|
| GitHub | Settings → SSH Keys | `ssh -T git@github.com` |
| Replit | SSH Pane → Keys tab | `ssh replit-nexus` |
| Cursor | Uses SSH config | Connect via Remote-SSH |

## One Key, Many Services

The beauty of this setup: **one YubiKey key works everywhere**.

1. Export public key once
2. Add that same public key to GitHub, Replit, Bitbucket, servers, etc.
3. SSH config routes connections through YubiKey automatically
4. PIN prompt confirms each new connection

Your private key never leaves the YubiKey hardware.
