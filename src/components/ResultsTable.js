import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import ExportExcel from './ExportExcel';
import './resultsTable.module.css'

const ResultsTable = ({ headers, data, onGridReady }) => {
    const defaultColDef = {
        resizable: true,
        sortable: true,
        editable: true,
    };
    return (
        <>
            <ExportExcel excelData={data} />
            <div className="ag-theme-alpine" style={{ height: '22rem', width: '100%' }} >
                <AgGridReact
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    rowData={data}
                    columnDefs={headers}>
                </AgGridReact>
            </div>
        </>
    );
}

export default ResultsTable