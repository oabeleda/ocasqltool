#!/usr/bin/env node

/**
 * License Generator CLI Tool
 *
 * Usage:
 *   node src/license/generator.js --email user@example.com --tier professional --years 1
 *   node src/license/generator.js --email user@example.com --tier professional --months 6
 *   node src/license/generator.js --generate-keys  // Generate RSA key pair
 *   node src/license/generator.js --machine-id HASH --email user@example.com --tier professional --years 1
 *
 * This tool should be run by you (the developer) to generate signed licenses for customers.
 * The generated license JSON should be sent to the customer to paste into the app.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');
const CONSTANTS_PATH = path.join(__dirname, 'constants.js');

const LICENSE_VERSION = 1;

/**
 * Generate RSA key pair for signing licenses
 */
function generateKeys() {
  console.log('Generating RSA key pair...');

  // Create keys directory if it doesn't exist
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  // Generate 2048-bit RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Save keys
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

  console.log(`✓ Private key saved to: ${PRIVATE_KEY_PATH}`);
  console.log(`✓ Public key saved to: ${PUBLIC_KEY_PATH}`);
  console.log('\n⚠️  IMPORTANT: Keep the private key secure and never share it!');
  console.log('⚠️  The public key needs to be added to src/license/constants.js\n');

  // Update constants.js with the new public key
  updateConstantsFile(publicKey);
}

/**
 * Update constants.js with the public key
 */
function updateConstantsFile(publicKey) {
  try {
    let content = fs.readFileSync(CONSTANTS_PATH, 'utf8');

    // Replace the placeholder public key (supports both export and const syntax)
    const publicKeyRegex = /(export )?const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----`;/;

    if (publicKeyRegex.test(content)) {
      content = content.replace(publicKeyRegex, `const PUBLIC_KEY = \`${publicKey}\`;`);
      fs.writeFileSync(CONSTANTS_PATH, content);
      console.log('✓ Public key updated in constants.js\n');
    } else {
      console.log('⚠️  Could not automatically update constants.js');
      console.log('Please manually update PUBLIC_KEY with:\n');
      console.log(publicKey);
    }
  } catch (error) {
    console.error('Error updating constants.js:', error.message);
  }
}

/**
 * Sign a license object with the private key
 */
function signLicense(license, privateKey) {
  // Create canonical JSON string (sorted keys)
  const dataString = JSON.stringify(license, Object.keys(license).sort());

  // Create signature
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(dataString);
  signer.end();

  return signer.sign(privateKey, 'base64');
}

/**
 * Generate a paid license
 */
function generateLicense(options) {
  const { email, tier, years, months, machineId } = options;

  // Validate inputs
  if (!email) {
    console.error('Error: --email is required');
    process.exit(1);
  }

  if (!tier || !['professional', 'enterprise'].includes(tier)) {
    console.error('Error: --tier must be "professional" or "enterprise"');
    process.exit(1);
  }

  if (!years && !months) {
    console.error('Error: Either --years or --months is required');
    process.exit(1);
  }

  if (!machineId) {
    console.error('Error: --machine-id is required');
    console.log('\nTo get the machine ID, the customer should run the app and it will be displayed in the trial screen.');
    process.exit(1);
  }

  // Check if keys exist
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('Error: Private key not found. Run with --generate-keys first.');
    process.exit(1);
  }

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

  // Calculate expiration date
  const now = new Date()-40;
  const expiresAt = new Date(now);

  if (years) {
    expiresAt.setFullYear(expiresAt.getFullYear() + parseInt(years));
  } else if (months) {
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(months));
  }

  // Create license object (without signature first)
  const license = {
    version: LICENSE_VERSION,
    type: 'paid',
    email,
    tier,
    machineId,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Sign the license
  const signature = signLicense(license, privateKey);

  // Add signature to license
  license.signature = signature;

  // Output the license
  console.log('\n' + '='.repeat(70));
  console.log('LICENSE GENERATED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log('\nLicense Details:');
  console.log(`  Email: ${email}`);
  console.log(`  Tier: ${tier}`);
  console.log(`  Machine ID: ${machineId.substring(0, 16)}...`);
  console.log(`  Issued: ${now.toLocaleDateString()}`);
  console.log(`  Expires: ${expiresAt.toLocaleDateString()}`);
  console.log(`  Duration: ${years ? years + ' year(s)' : months + ' month(s)'}`);
  console.log('\n' + '='.repeat(70));
  console.log('SEND THIS TO THE CUSTOMER:');
  console.log('='.repeat(70));
  console.log(JSON.stringify(license, null, 2));
  console.log('='.repeat(70));
  console.log('\nInstructions for customer:');
  console.log('1. Copy the entire JSON object above');
  console.log('2. In the app, click "Enter License Key"');
  console.log('3. Paste the JSON and click "Activate"\n');

  // Save to file
  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `license-${email.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`;
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, JSON.stringify(license, null, 2));

  console.log(`✓ License saved to: ${outputPath}\n`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--generate-keys') {
      options.generateKeys = true;
    } else if (arg === '--email' && args[i + 1]) {
      options.email = args[++i];
    } else if (arg === '--tier' && args[i + 1]) {
      options.tier = args[++i];
    } else if (arg === '--years' && args[i + 1]) {
      options.years = args[++i];
    } else if (arg === '--months' && args[i + 1]) {
      options.months = args[++i];
    } else if (arg === '--machine-id' && args[i + 1]) {
      options.machineId = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
License Generator CLI Tool

USAGE:
  node src/license/generator.js [OPTIONS]

OPTIONS:
  --generate-keys              Generate RSA key pair (run this first!)
  --email <email>              Customer's email address
  --tier <tier>                License tier (professional|enterprise)
  --years <number>             License duration in years
  --months <number>            License duration in months
  --machine-id <hash>          Customer's machine ID hash
  --help, -h                   Show this help message

EXAMPLES:
  # Generate keys (first time setup)
  node src/license/generator.js --generate-keys

  # Generate a 1-year professional license
  node src/license/generator.js \\
    --email customer@example.com \\
    --tier professional \\
    --years 1 \\
    --machine-id abc123def456...

  # Generate a 6-month enterprise license
  node src/license/generator.js \\
    --email customer@example.com \\
    --tier enterprise \\
    --months 6 \\
    --machine-id abc123def456...

NOTES:
  - Run --generate-keys first to create the RSA key pair
  - Keep the private key (src/license/keys/private.pem) secure!
  - The machine ID is shown in the app's trial screen
  - Generated licenses are saved to src/license/generated/
`);
}

// Main execution
const options = parseArgs();

if (options.generateKeys) {
  generateKeys();
} else if (Object.keys(options).length === 0) {
  console.error('Error: No options provided\n');
  showHelp();
  process.exit(1);
} else {
  generateLicense(options);
}
