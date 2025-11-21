import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import { getConnections, saveConnections } from "../utils/api";
import { getLicenseFeatures } from "../utils/licenseApi";
import Modal from "react-modal";

if (typeof document !== 'undefined') {
    Modal.setAppElement('#root');
}

export const ConnectionsManager = ({ onClose }) => {
    const [connections, setConnections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentConnection, setCurrentConnection] = useState({ url: '', username: '', password: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [licenseFeatures, setLicenseFeatures] = useState(null);

    const columnDefs = [
        { field: 'url', headerName: "URL", flex: 2 },
        { field: 'username', headerName: "Username", flex: 1 },
        {
            headerName: "Actions",
            cellRenderer: (params) => {
                return (
                    <div className="flex gap-2">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                            onClick={() => handleEdit(params.rowIndex)}
                        >
                            Edit
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                            onClick={() => handleDelete(params.rowIndex)}
                        >
                            Delete
                        </button>
                    </div>
                );
            },
            flex: 1
        }
    ];

    const defaultColDef = {
        sortable: true,
        resizable: true
    };

    useEffect(() => {
        loadConnections();
        loadLicenseFeatures();
    }, []);

    const loadConnections = async () => {
        const data = await getConnections();
        const parsed = JSON.parse(data);
        setConnections(parsed.connections || []);
    };

    const loadLicenseFeatures = async () => {
        const result = await getLicenseFeatures();
        if (result.success) {
            setLicenseFeatures(result.features);
        }
    };

    const handleAdd = () => {
        // Check if license allows adding more connections
        if (licenseFeatures && connections.length >= licenseFeatures.maxConnections) {
            alert(`Your license tier allows a maximum of ${licenseFeatures.maxConnections} saved connections. Please upgrade your license to add more connections.`);
            return;
        }

        setEditMode(false);
        setCurrentConnection({ url: '', username: '', password: '' });
        setShowModal(true);
    };

    const handleEdit = (index) => {
        setEditMode(true);
        setEditIndex(index);
        setCurrentConnection({ ...connections[index] });
        setShowModal(true);
    };

    const handleDelete = async (index) => {
        if (window.confirm('Are you sure you want to delete this connection?')) {
            const newConnections = connections.filter((_, i) => i !== index);
            await saveConnections(JSON.stringify({ connections: newConnections }));
            setConnections(newConnections);
        }
    };

    const handleSave = async () => {
        if (!currentConnection.url || !currentConnection.username || !currentConnection.password) {
            alert("Please fill in all fields");
            return;
        }

        let newConnections;
        if (editMode) {
            newConnections = [...connections];
            newConnections[editIndex] = currentConnection;
        } else {
            newConnections = [...connections, currentConnection];
        }

        await saveConnections(JSON.stringify({ connections: newConnections }));
        setConnections(newConnections);
        setShowModal(false);
        setCurrentConnection({ url: '', username: '', password: '' });
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
            maxWidth: '90%'
        }
    };

    return (
        <div className="p-4" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Manage Connections</h2>
                    {licenseFeatures && (
                        <p className="text-sm text-gray-600 mt-1">
                            {connections.length} of {licenseFeatures.maxConnections === Infinity ? '∞' : licenseFeatures.maxConnections} connections used
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleAdd}
                    >
                        Add Connection
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="ag-theme-alpine flex-1" style={{ width: '100%' }}>
                <AgGridReact
                    defaultColDef={defaultColDef}
                    rowData={connections}
                    columnDefs={columnDefs}
                />
            </div>

            <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                style={modalStyles}
                contentLabel={editMode ? "Edit Connection" : "Add Connection"}
            >
                <h3 className="text-xl font-bold mb-4">
                    {editMode ? "Edit Connection" : "Add Connection"}
                </h3>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        URL
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        value={currentConnection.url}
                        onChange={(e) => setCurrentConnection({ ...currentConnection, url: e.target.value })}
                        placeholder="https://example.oraclecloud.com"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        value={currentConnection.username}
                        onChange={(e) => setCurrentConnection({ ...currentConnection, username: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="password"
                        value={currentConnection.password}
                        onChange={(e) => setCurrentConnection({ ...currentConnection, password: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </Modal>
        </div>
    );
};
