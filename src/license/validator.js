const crypto = require('crypto');
const { getMachineId } = require('./machineId');
const { PUBLIC_KEY, LICENSE_TIERS, TRIAL_DURATION_DAYS, LICENSE_VERSION } = require('./constants');

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
    if (now > expirationDate) {
      return { valid: false, error: 'License has expired' };
    }

    // Check if issued date is in the future (clock tampering detection)
    if (issuedDate > now) {
      return { valid: false, error: 'License issued date is in the future' };
    }

    // For paid licenses, validate machine ID
    if (type === 'paid' && !skipMachineIdCheck) {
      if (!machineId) {
        return { valid: false, error: 'License missing machine ID' };
      }

      const currentMachineId = getMachineId();
      if (machineId !== currentMachineId) {
        return { valid: false, error: 'License is bound to a different machine' };
      }
    }

    // Validate signature (if public key is set)
    if (signature && PUBLIC_KEY && !PUBLIC_KEY.includes('PLACEHOLDER')) {
      const isSignatureValid = verifySignature(license, signature);
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
 * @returns {boolean}
 */
function verifySignature(license, signature) {
  try {
    // Create a copy without the signature for verification
    const { signature: _, ...licenseData } = license;

    // Create canonical JSON string (sorted keys)
    const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort());

    // Verify signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(dataString);
    verifier.end();

    return verifier.verify(PUBLIC_KEY, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Create a trial license
 *
 * @param {string} email - User's email (optional for trial)
 * @returns {Object} Trial license object
 */
function createTrialLicense(email = 'trial@local') {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + TRIAL_DURATION_DAYS);

  return {
    version: LICENSE_VERSION,
    type: 'trial',
    email,
    tier: 'trial',
    machineId: null, // No machine binding for trial
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    signature: null, // No signature for trial
  };
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
