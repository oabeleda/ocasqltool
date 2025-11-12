import { useState, useEffect } from "react";
import Modal from "react-modal";

if (typeof document !== 'undefined') {
    Modal.setAppElement('#root');
}

export const ParametersModal = ({ isOpen, parameters, onExecute, onCancel }) => {
    const [paramValues, setParamValues] = useState({});

    // Initialize parameter values when parameters change or modal opens
    useEffect(() => {
        if (isOpen && parameters.length > 0) {
            const newParamValues = parameters.reduce((acc, param) => ({
                ...acc,
                [param]: { type: 'string', value: '' }
            }), {});
            setParamValues(newParamValues);
        }
    }, [isOpen, parameters]);

    const handleExecute = () => {
        // Validate that non-null parameters have values
        const missingValues = parameters.filter(param => {
            const paramValue = paramValues[param];
            if (!paramValue) return true; // Missing parameter definition
            return paramValue.type !== 'null' &&
                   (paramValue.value === '' || paramValue.value === null || paramValue.value === undefined);
        });

        if (missingValues.length > 0) {
            alert(`Please provide values for the following parameters:\n${missingValues.join(', ')}`);
            return;
        }

        onExecute(paramValues);
    };

    const handleTypeChange = (param, newType) => {
        setParamValues({
            ...paramValues,
            [param]: {
                type: newType,
                value: newType === 'null' ? '' : (paramValues[param]?.value || '')
            }
        });
    };

    const handleValueChange = (param, newValue) => {
        setParamValues({
            ...paramValues,
            [param]: {
                ...(paramValues[param] || { type: 'string' }),
                value: newValue
            }
        });
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
                {parameters.map((param) => {
                    const paramValue = paramValues[param] || { type: 'string', value: '' };
                    return (
                        <div key={param} className="mb-4 p-3 border border-gray-300 rounded">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                {param}
                            </label>

                            <div className="mb-2">
                                <label className="text-gray-600 text-xs mb-1 block">Type:</label>
                                <div className="flex gap-3">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name={`type-${param}`}
                                            value="string"
                                            checked={paramValue.type === 'string'}
                                            onChange={(e) => handleTypeChange(param, e.target.value)}
                                        />
                                        <span className="ml-1 text-sm">String</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name={`type-${param}`}
                                            value="number"
                                            checked={paramValue.type === 'number'}
                                            onChange={(e) => handleTypeChange(param, e.target.value)}
                                        />
                                        <span className="ml-1 text-sm">Number</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name={`type-${param}`}
                                            value="null"
                                            checked={paramValue.type === 'null'}
                                            onChange={(e) => handleTypeChange(param, e.target.value)}
                                        />
                                        <span className="ml-1 text-sm">NULL</span>
                                    </label>
                                </div>
                            </div>

                            {paramValue.type !== 'null' && (
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type={paramValue.type === 'number' ? 'number' : 'text'}
                                    value={paramValue.value}
                                    onChange={(e) => handleValueChange(param, e.target.value)}
                                    placeholder={`Enter ${paramValue.type} value for ${param}`}
                                />
                            )}
                            {paramValue.type === 'null' && (
                                <div className="text-gray-500 italic text-sm py-2">
                                    This parameter will be set to NULL
                                </div>
                            )}
                        </div>
                    );
                })}
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
