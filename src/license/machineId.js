const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

let cachedMachineId = null;

/**
 * Get a unique machine identifier
 * This uses hardware identifiers (MAC, CPU, etc.) to create a consistent ID
 * The ID is cached to ensure consistency during runtime
 *
 * @returns {string} Hashed machine ID
 */
function getMachineId() {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    // Get the raw machine ID (uses MAC address, hostname, etc.)
    const rawId = machineIdSync({ original: true });

    // Hash it for privacy and consistency
    const hash = crypto
      .createHash('sha256')
      .update(rawId)
      .digest('hex');

    cachedMachineId = hash;
    return hash;
  } catch (error) {
    console.error('Error generating machine ID:', error);
    // Fallback to a less reliable but still usable identifier
    const fallbackId = `${process.platform}-${process.arch}-${require('os').hostname()}`;
    const hash = crypto
      .createHash('sha256')
      .update(fallbackId)
      .digest('hex');

    cachedMachineId = hash;
    return hash;
  }
}

/**
 * Clear the cached machine ID (useful for testing)
 */
function clearCache() {
  cachedMachineId = null;
}

module.exports = {
  getMachineId,
  clearCache,
};
