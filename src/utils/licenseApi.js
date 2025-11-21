/**
 * License API - Wrapper for IPC calls related to licensing
 * These functions are called from React components to communicate with the main process
 */

/**
 * Get the current license from storage
 * @returns {Promise<{success: boolean, license?: Object, error?: string}>}
 */
export async function getLicense() {
  return window.electronAPI.getLicense();
}

/**
 * Save a license to storage
 * @param {Object} license - The license object to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveLicense(license) {
  return window.electronAPI.saveLicense(license);
}

/**
 * Validate the current license
 * @returns {Promise<{valid: boolean, error?: string, license?: Object, daysRemaining?: number, isExpiringSoon?: boolean, isExpiringSoonFinal?: boolean}>}
 */
export async function validateLicense() {
  return window.electronAPI.validateLicense();
}

/**
 * Get the current machine ID
 * @returns {Promise<{success: boolean, machineId?: string, error?: string}>}
 */
export async function getMachineId() {
  return window.electronAPI.getMachineId();
}

/**
 * Initialize trial license (called on first run)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function initializeTrial() {
  return window.electronAPI.initializeTrial();
}

/**
 * Get license features based on current license
 * @returns {Promise<{success: boolean, features?: Object, error?: string}>}
 */
export async function getLicenseFeatures() {
  return window.electronAPI.getLicenseFeatures();
}
