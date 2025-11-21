# OCA Query Tool - License System Documentation

## Overview

OCA Query Tool now includes a licensing system with:
- **30-day free trial** on first launch
- **Machine ID binding** for paid licenses
- **Cryptographic signatures** to prevent tampering
- **Multiple license tiers** (trial, professional, enterprise)
- **Automatic expiration warnings** (30 days and 7 days before expiration)

---

## Quick Start

### For End Users

1. **First Launch**: You'll automatically get a 30-day free trial
2. **During Trial**: A banner shows remaining trial days
3. **Entering a License**:
   - Click "Enter License" when prompted
   - Copy your Machine ID (shown in the dialog)
   - Send the Machine ID to get your license
   - Paste the received license JSON into the app
   - Click "Activate License"

### For Developers/License Issuers

#### 1. Initial Setup (One-time)

The RSA keys have already been generated. The files are located at:
- Private key: `src/license/keys/private.pem` (⚠️ **KEEP SECURE - NEVER COMMIT**)
- Public key: `src/license/keys/public.pem` (already embedded in constants.js)

#### 2. Generating Licenses for Customers

When a customer purchases a license, they'll provide you with their Machine ID. Use the generator script:

```bash
# Generate a 1-year professional license
npm run generate-license -- \
  --email customer@example.com \
  --tier professional \
  --years 1 \
  --machine-id <CUSTOMER_MACHINE_ID>

# Generate a 6-month enterprise license
npm run generate-license -- \
  --email customer@example.com \
  --tier enterprise \
  --months 6 \
  --machine-id <CUSTOMER_MACHINE_ID>
```

**Available tiers:**
- `professional` - Full features, up to 10 saved connections
- `enterprise` - Full features, unlimited connections

**The script will:**
1. Generate a signed license JSON
2. Display it in the terminal
3. Save it to `src/license/generated/license-*.json`

**Send the JSON to the customer** - they'll paste it into the app.

#### 3. Manual Generator Usage

You can also run the generator directly with more options:

```bash
node src/license/generator.js --help
```

---

## License File Structure

```json
{
  "version": 1,
  "type": "paid",
  "email": "customer@example.com",
  "tier": "professional",
  "machineId": "abc123...",
  "issuedAt": "2025-11-20T00:00:00.000Z",
  "expiresAt": "2026-11-20T23:59:59.000Z",
  "signature": "base64_signature_here"
}
```

**Fields:**
- `version`: License format version (currently 1)
- `type`: "trial" or "paid"
- `email`: Customer's email
- `tier`: "trial", "professional", or "enterprise"
- `machineId`: SHA-256 hash of customer's hardware ID (null for trial)
- `issuedAt`: License creation timestamp
- `expiresAt`: License expiration timestamp
- `signature`: RSA-SHA256 signature (null for trial)

---

## License Tiers & Features

### Trial (30 days)
- Max 1000 rows per query
- Excel export: ✓
- SQL history: ✓
- Max 3 saved connections
- No machine binding

### Professional
- Unlimited rows
- Excel export: ✓
- SQL history: ✓
- Max 10 saved connections
- Machine ID bound

### Enterprise
- Unlimited rows
- Excel export: ✓
- SQL history: ✓
- Unlimited saved connections
- Machine ID bound

---

## How It Works

### Trial Creation
On first launch, the app automatically creates a trial license:
- No machine ID binding
- No signature required
- 30-day duration from install date
- Stored in: `~/.config/OCA Query Tool/license.json` (Linux)

### License Validation
The app validates licenses:
1. **On startup** - Initializes trial if no license exists
2. **Before login** - Ensures valid license before connecting
3. **Before query execution** - Checks license before running SQL
4. **Every hour** - Periodic background check

### Expiration Warnings
- **30 days before expiration**: Info modal (closeable)
- **7 days before expiration**: Warning modal (closeable)
- **After expiration**: Critical modal (blocks usage until license entered)

### Security Features
- **RSA-2048 signatures** prevent license tampering
- **Machine ID binding** prevents license sharing
- **Cryptographic hashing** for machine identification
- **Multiple validation points** throughout app lifecycle

---

## File Locations

### Development
- License file: `~/.config/Electron/license.json`
- SQL history: `~/.config/Electron/sqlHistory.json`

### Production (Packaged App)
- License file: `~/.config/OCA Query Tool/license.json`
- SQL history: `~/.config/OCA Query Tool/sqlHistory.json`

### Windows (Packaged App)
- License file: `%APPDATA%\OCA Query Tool\license.json`
- SQL history: `%APPDATA%\OCA Query Tool\sqlHistory.json`

---

## Testing

### Test Trial Creation
1. Delete license file: `rm ~/.config/Electron/license.json`
2. Run app: `npm run dev`
3. Verify: 30-day trial is created automatically

### Test License Activation
1. Get your machine ID from the app (click "Show" in license prompt)
2. Generate a test license:
   ```bash
   npm run generate-license -- \
     --email test@example.com \
     --tier professional \
     --years 1 \
     --machine-id YOUR_MACHINE_ID
   ```
3. Copy the generated JSON
4. In the app, click "Enter License" and paste the JSON
5. Click "Activate License"
6. Verify: App shows professional tier features

### Test Expiration
To test expiration warnings, you can manually edit the license file:
```bash
# Edit the license file
nano ~/.config/Electron/license.json

# Change expiresAt to a date 5 days in the future
# Restart the app
npm run dev

# You should see the "expiring soon" warning
```

---

## Troubleshooting

### "Invalid license signature"
- Make sure the public key in `src/license/constants.js` matches your private key
- Regenerate keys if needed: `npm run generate-keys`

### "License is bound to a different machine"
- The license was generated for a different machine ID
- Generate a new license with the correct machine ID

### "License has expired"
- The license expiration date has passed
- Generate a new license with extended duration

### Machine ID Changed
- Hardware changes (new MAC address, CPU, etc.) can change the machine ID
- Generate a new license with the updated machine ID
- Consider allowing license transfers (manual process)

---

## Distribution Notes

### Before Packaging for Production

1. **Ensure .gitignore is correct**:
   - `src/license/keys/` should be ignored
   - `src/license/generated/` should be ignored

2. **Public key is embedded**:
   - The public key in `src/license/constants.js` will be included in the package
   - The private key should NEVER be in the packaged app

3. **Build and package**:
   ```bash
   npm run build
   npm run package-linux  # or package-win
   ```

### Security Considerations

- **Keep private key secure**: Never commit to git, never share
- **Backup private key**: Store securely - if lost, you can't generate licenses
- **Monitor usage**: Consider logging license activations
- **Update mechanism**: Plan for license renewal/upgrade flow

---

## Future Enhancements

Potential improvements for the licensing system:

1. **Online activation server**:
   - Automated license generation
   - Usage analytics
   - Remote license revocation

2. **License transfers**:
   - Allow customers to deactivate and reactivate on new machine
   - Limit number of transfers

3. **Subscription management**:
   - Integration with Stripe/Gumroad
   - Automatic renewal reminders
   - Self-service license portal

4. **Grace period**:
   - Allow limited usage after expiration
   - Reminder emails before expiration

5. **Floating licenses**:
   - License valid for N concurrent users
   - Requires online license server

---

## Support

For licensing issues:
1. Check the Machine ID hasn't changed
2. Verify license hasn't expired
3. Regenerate license if needed
4. Contact support with license email for assistance

---

**IMPORTANT SECURITY NOTES:**
- ✅ Public key is safe to distribute (embedded in app)
- ⚠️ Private key must NEVER be shared or committed to git
- ⚠️ Backup your private key securely - if lost, you can't issue licenses
- ⚠️ Keep `src/license/keys/private.pem` in a secure location
