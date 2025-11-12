import { useState, useEffect } from "react";
import Modal from "react-modal";
import { getHistoryGroupedByDate, formatTime } from "../utils/sqlHistory";

if (typeof document !== 'undefined') {
    Modal.setAppElement('#root');
}

export const SqlHistoryModal = ({ isOpen, onClose, onSelectQuery }) => {
    const [historyByDate, setHistoryByDate] = useState({});
    const [expandedDates, setExpandedDates] = useState({});

    // Load history when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadHistory = async () => {
                const grouped = await getHistoryGroupedByDate();
                setHistoryByDate(grouped);

                // Auto-expand today's entries
                const today = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                setExpandedDates({ [today]: true });
            };
            loadHistory();
        }
    }, [isOpen]);

    const toggleDateExpansion = (dateKey) => {
        setExpandedDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    const handleSelectQuery = (sql) => {
        onSelectQuery(sql);
        onClose();
    };


    const modalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '20px'
        }
    };

    const dateKeys = Object.keys(historyByDate);
    const hasHistory = dateKeys.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={modalStyles}
            contentLabel="SQL Query History"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">SQL Query History</h3>
                <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            {!hasHistory && (
                <div className="text-gray-500 text-center py-8">
                    No query history yet. Execute a query to see it here.
                </div>
            )}

            {hasHistory && (
                <div className="space-y-3">
                    {dateKeys.map(dateKey => {
                        const entries = historyByDate[dateKey];
                        const isExpanded = expandedDates[dateKey];

                        return (
                            <div key={dateKey} className="border border-gray-300 rounded">
                                {/* Date Header */}
                                <div
                                    className="bg-gray-100 px-4 py-2 cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                                    onClick={() => toggleDateExpansion(dateKey)}
                                >
                                    <span className="font-semibold text-gray-700">
                                        {dateKey} ({entries.length} {entries.length === 1 ? 'query' : 'queries'})
                                    </span>
                                    <span className="text-gray-600">
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                </div>

                                {/* Query Entries */}
                                {isExpanded && (
                                    <div className="divide-y divide-gray-200">
                                        {entries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                                onClick={() => handleSelectQuery(entry.sql)}
                                                title="Click to load this query into the editor"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {formatTime(entry.timestamp)}
                                                    </span>
                                                </div>
                                                <pre className="text-sm font-mono bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                                    {entry.sql}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500 text-center">
                Press CTRL+F8 to open this history. Last 100 queries are saved.
            </div>
        </Modal>
    );
};
