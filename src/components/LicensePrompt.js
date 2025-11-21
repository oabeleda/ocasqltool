import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { saveLicense, validateLicense, getMachineId } from '../utils/licenseApi';

if (typeof document !== 'undefined') {
  Modal.setAppElement('#root');
}

export const LicensePrompt = ({ isOpen, licenseStatus, onLicenseActivated }) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [machineId, setMachineId] = useState('');
  const [showMachineId, setShowMachineId] = useState(false);

  // Load machine ID when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadMachineId = async () => {
        const result = await getMachineId();
        if (result.success) {
          setMachineId(result.machineId);
        }
      };
      loadMachineId();
    }
  }, [isOpen]);

  const handleActivate = async () => {
    setError('');
    setLoading(true);

    try {
      // Parse the license JSON
      let license;
      try {
        license = JSON.parse(licenseInput.trim());
      } catch (e) {
        setError('Invalid license format. Please paste the complete license JSON.');
        setLoading(false);
        return;
      }

      // Save the license
      const saveResult = await saveLicense(license);
      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save license');
        setLoading(false);
        return;
      }

      // Validate the license
      const validationResult = await validateLicense();
      if (!validationResult.valid) {
        setError(validationResult.error || 'License validation failed');
        setLoading(false);
        return;
      }

      // Success!
      setLicenseInput('');
      onLicenseActivated();
    } catch (err) {
      setError(`Activation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    alert('Machine ID copied to clipboard!');
  };

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxWidth: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      padding: '20px',
    },
  };

  // Determine the message to show based on license status
  const getHeaderMessage = () => {
    if (!licenseStatus) {
      return { title: 'Welcome to OCA Query Tool', type: 'trial' };
    }

    const { valid, license, daysRemaining } = licenseStatus;

    if (valid && license?.type === 'trial') {
      return {
        title: 'Trial Version',
        message: `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining in your trial.`,
        type: 'trial',
      };
    }

    if (!valid) {
      return {
        title: 'License Expired',
        message: 'Your license has expired. Please enter a valid license to continue.',
        type: 'expired',
      };
    }

    return { title: 'Enter License', type: 'normal' };
  };

  const headerInfo = getHeaderMessage();

  return (
    <Modal isOpen={isOpen} style={modalStyles} contentLabel="License Activation" shouldCloseOnOverlayClick={false}>
      <div>
        <h2 className="text-2xl font-bold mb-4">{headerInfo.title}</h2>

        {headerInfo.message && (
          <div
            className={`mb-4 p-3 rounded ${
              headerInfo.type === 'expired'
                ? 'bg-red-100 text-red-800'
                : headerInfo.type === 'trial'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {headerInfo.message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">License Key (JSON)</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 font-mono text-xs"
            rows="10"
            placeholder='Paste your license JSON here...'
            value={licenseInput}
            onChange={(e) => setLicenseInput(e.target.value)}
          />
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 font-bold py-2 px-4 rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            onClick={handleActivate}
            disabled={loading || !licenseInput.trim()}
          >
            {loading ? 'Activating...' : 'Activate License'}
          </button>

          {licenseStatus?.valid && licenseStatus?.license?.type === 'trial' && (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => onLicenseActivated()}
            >
              Continue Trial
            </button>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Machine ID</span>
            <button
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              onClick={() => setShowMachineId(!showMachineId)}
            >
              {showMachineId ? 'Hide' : 'Show'}
            </button>
          </div>

          {showMachineId && machineId && (
            <div className="bg-gray-100 p-3 rounded">
              <div className="flex justify-between items-center gap-2">
                <code className="text-xs break-all">{machineId}</code>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded whitespace-nowrap"
                  onClick={copyMachineId}
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Send this Machine ID to get your license key.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <p className="mb-2">
            <strong>Need a license?</strong> Contact us to purchase.
          </p>
          <p>
            <strong>How to activate:</strong> Copy the license JSON we sent you and paste it into the
            text area above, then click "Activate License".
          </p>
        </div>
      </div>
    </Modal>
  );
};
