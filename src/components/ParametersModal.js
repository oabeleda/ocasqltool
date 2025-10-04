import { useState } from "react";
import Modal from "react-modal";

if (typeof document !== 'undefined') {
    Modal.setAppElement('#root');
}

export const ParametersModal = ({ isOpen, parameters, onExecute, onCancel }) => {
    const [paramValues, setParamValues] = useState(
        parameters.reduce((acc, param) => ({ ...acc, [param]: '' }), {})
    );

    const handleExecute = () => {
        onExecute(paramValues);
    };

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
            maxHeight: '80vh',
            overflow: 'auto'
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            style={modalStyles}
            contentLabel="SQL Parameters"
        >
            <h3 className="text-xl font-bold mb-4">SQL Parameters</h3>
            <div className="mb-4">
                {parameters.map((param) => (
                    <div key={param} className="mb-3">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {param}
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={paramValues[param]}
                            onChange={(e) => setParamValues({ ...paramValues, [param]: e.target.value })}
                            placeholder={`Enter value for ${param}`}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleExecute}
                >
                    Execute
                </button>
            </div>
        </Modal>
    );
};
