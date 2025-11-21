import Modal from 'react-modal';

if (typeof document !== 'undefined') {
  Modal.setAppElement('#root');
}

export const LicenseExpiredModal = ({ isOpen, daysRemaining, onEnterLicense, onClose }) => {
  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      maxWidth: '90%',
      padding: '20px',
    },
  };

  // Determine the severity and message
  const getWarningInfo = () => {
    if (daysRemaining === undefined || daysRemaining === null) {
      return {
        title: 'License Expired',
        message: 'Your license has expired. Please enter a valid license to continue using OCA Query Tool.',
        severity: 'critical',
        showClose: false,
      };
    }

    if (daysRemaining <= 0) {
      return {
        title: 'License Expired',
        message: 'Your license has expired. Please enter a valid license to continue using OCA Query Tool.',
        severity: 'critical',
        showClose: false,
      };
    }

    if (daysRemaining <= 7) {
      return {
        title: 'License Expiring Soon',
        message: `Your license will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Please renew your license to avoid interruption.`,
        severity: 'warning',
        showClose: true,
      };
    }

    if (daysRemaining <= 30) {
      return {
        title: 'License Expiring',
        message: `Your license will expire in ${daysRemaining} days. Consider renewing soon to ensure uninterrupted access.`,
        severity: 'info',
        showClose: true,
      };
    }

    return null;
  };

  const warningInfo = getWarningInfo();

  if (!warningInfo) {
    return null;
  }

  const bgColor =
    warningInfo.severity === 'critical'
      ? 'bg-red-100 border-red-400'
      : warningInfo.severity === 'warning'
      ? 'bg-yellow-100 border-yellow-400'
      : 'bg-blue-100 border-blue-400';

  const textColor =
    warningInfo.severity === 'critical'
      ? 'text-red-800'
      : warningInfo.severity === 'warning'
      ? 'text-yellow-800'
      : 'text-blue-800';

  return (
    <Modal
      isOpen={isOpen}
      style={modalStyles}
      contentLabel="License Warning"
      shouldCloseOnOverlayClick={warningInfo.showClose}
      onRequestClose={warningInfo.showClose ? onClose : undefined}
    >
      <div>
        <div className={`border-l-4 p-4 mb-4 ${bgColor} ${textColor}`}>
          <h3 className="text-xl font-bold mb-2">{warningInfo.title}</h3>
          <p>{warningInfo.message}</p>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <p className="mb-2">
            <strong>To renew your license:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Contact us to purchase a license renewal</li>
            <li>You'll receive a license key via email</li>
            <li>Click "Enter License" below to activate</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onEnterLicense}
          >
            Enter License Key
          </button>

          {warningInfo.showClose && (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Remind Me Later
            </button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600 text-center">
          Need help? Contact support for assistance.
        </div>
      </div>
    </Modal>
  );
};
