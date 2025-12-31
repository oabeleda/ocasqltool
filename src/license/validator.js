const crypto = require('crypto');
const { getMachineId } = require('./machineId');
const { PUBLIC_KEY, LICENSE_TIERS, TRIAL_DURATION_DAYS, LICENSE_VERSION, getTrialPrivateKey, TRIAL_PUBLIC_KEY } = require('./constants');

/**
 * License validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the license is valid
 * @property {string} [error] - Error message if invalid
 * @property {Object} [license] - Parsed license data if valid
 * @property {number} [daysRemaining] - Days until expiration
 * @property {boolean} [isExpiringSoon] - True if expiring within 30 days
 * @property {boolean} [isExpiringSoonFinal] - True if expiring within 7 days
 */

/**
 * Validate a license object
 *
 * @param {Object} license - The license object to validate
 * @param {boolean} skipMachineIdCheck - Skip machine ID validation (for trial)
 * @returns {ValidationResult}
 */
function validateLicense(license, skipMachineIdCheck = false) {
  try {
    // Check required fields
    if (!license || typeof license !== 'object') {
      return { valid: false, error: 'Invalid license format' };
    }

    const { type, email, tier, machineId, issuedAt, expiresAt, signature, version } = license;

    // Validate version
    if (version && version !== LICENSE_VERSION) {
      return { valid: false, error: 'License version mismatch' };
    }

    // Validate type
    if (!type || !['trial', 'paid'].includes(type)) {
      return { valid: false, error: 'Invalid license type' };
    }

    // Validate tier
    if (!tier || !LICENSE_TIERS[tier]) {
      return { valid: false, error: 'Invalid license tier' };
    }

    // Validate dates
    if (!issuedAt || !expiresAt) {
      return { valid: false, error: 'Missing license dates' };
    }

    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const issuedDate = new Date(issuedAt);

    if (isNaN(expirationDate.getTime()) || isNaN(issuedDate.getTime())) {
      return { valid: false, error: 'Invalid license dates' };
    }
    // Check if license has expired
    if (now.getTime() > expirationDate.getTime()) {
      return { valid: false, error: 'License has expired' };
    }

    // Check if issued date is in the future (clock tampering detection)
    if (issuedDate > now) {
      return { valid: false, error: 'License issued date is in the future' };
    }

    // Validate machine ID for ALL license types
    if (!machineId) {
      return { valid: false, error: 'License missing machine ID' };
    }

    if (!skipMachineIdCheck) {
      const currentMachineId = getMachineId();
      if (machineId !== currentMachineId) {
        return { valid: false, error: 'License is bound to a different machine' };
      }
    }

    // Validate signature for ALL license types
    if (!signature) {
      return { valid: false, error: 'License missing signature' };
    }

    // Use the appropriate public key based on license type
    const publicKey = type === 'trial' ? TRIAL_PUBLIC_KEY : PUBLIC_KEY;

    if (publicKey && !publicKey.includes('PLACEHOLDER')) {
      const isSignatureValid = verifySignature(license, signature, publicKey);
      if (!isSignatureValid) {
        return { valid: false, error: 'Invalid license signature' };
      }
    }

    // Calculate days remaining
    const msRemaining = expirationDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    return {
      valid: true,
      license,
      daysRemaining,
      isExpiringSoon: daysRemaining <= 30,
      isExpiringSoonFinal: daysRemaining <= 7,
    };
  } catch (error) {
    console.error('License validation error:', error);
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

/**
 * Verify the RSA signature of a license
 *
 * @param {Object} license - The license object
 * @param {string} signature - The base64-encoded signature
 * @param {string} publicKey - The public key to verify against
 * @returns {boolean}
 */
function verifySignature(license, signature, publicKey = PUBLIC_KEY) {
  try {
    // Create a copy without the signature for verification
    const { signature: _, ...licenseData } = license;

    // Create canonical JSON string (sorted keys)
    const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort());

    // Verify signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(dataString);
    verifier.end();

    return verifier.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Sign a trial license with the embedded trial key
 *
 * @param {Object} license - The license object (without signature)
 * @returns {string} Base64-encoded signature
 */
function signTrialLicense(license) {
  try {
    const { signature: _, ...licenseData } = license;
    const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort());

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(dataString);
    signer.end();

    return signer.sign(getTrialPrivateKey(), 'base64');
  } catch (error) {
    console.error('Trial signing error:', error);
    throw error;
  }
}

/**
 * Create a trial license (machine-bound and signed)
 *
 * @param {string} machineId - The machine ID to bind the trial to
 * @param {string} email - User's email (optional for trial)
 * @param {Date} startDate - Original install date (optional, for preventing trial reset)
 * @returns {Object} Trial license object
 */
function createTrialLicense(machineId, email = 'trial@local', startDate = null) {
  if (!machineId) {
    throw new Error('Machine ID is required for trial license');
  }

  // Use provided start date or current date
  const issuedAt = startDate || new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + TRIAL_DURATION_DAYS);

  const license = {
    version: LICENSE_VERSION,
    type: 'trial',
    email,
    tier: 'trial',
    machineId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Sign the trial license
  license.signature = signTrialLicense(license);

  return license;
}

/**
 * Get license features based on tier
 *
 * @param {string} tier - License tier
 * @returns {Object} Feature object
 */
function getLicenseFeatures(tier) {
  return LICENSE_TIERS[tier] || LICENSE_TIERS.trial;
}

module.exports = {
  validateLicense,
  verifySignature,
  createTrialLicense,
  getLicenseFeatures,
};
