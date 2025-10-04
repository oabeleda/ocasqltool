import { useState, useEffect } from "react";
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import Editor from './Editor';
import ResultPanel from "./ResultsPanel";
import { isConnected, run, logout } from "../utils/api";
import { Login } from "./Login";
import { ConnectionsManager } from "./ConnectionsManager";
import { ParametersModal } from "./ParametersModal";
import transformResultsForRBT from "./transformResultsForRBT";
import ProgressIndicator from "./ProgressIndicator";
import { extractParameters, replaceParameters } from "../utils/sqlParams";
import './main.module.css'


export default function Main() {

  const [sizes, setSizes] = useState(['250px', '250px']);
  const [rows, setRows] = useState()
  const [error, setError] = useState()
  const [headers, setHeaders] = useState()
  const [data, setData] = useState()
  const [numRows, setNumRows] = useState(10)
  const [connected, setConnected] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [session, setSession] = useState([])
  const [showConnectionsManager, setShowConnectionsManager] = useState(false)
  const [showParamsModal, setShowParamsModal] = useState(false)
  const [currentSql, setCurrentSql] = useState('')
  const [sqlParameters, setSqlParameters] = useState([])

  useEffect(() => {
    transformResultsForRBT(rows, setHeaders, setData);
  }, [rows]);

  useEffect(() => {
    async function checkConnection() {
      const response = await isConnected()
      if (response) {
        setConnected(true)
      }
    }

    checkConnection()
  }, [connected])

  const DisconnectIcon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />

      {/* <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" /> */}
    </svg>
  }


  const handleRowNumChange = async (event) => {
    const val = event.target.value
    await setNumRows(val)
  }

  const onExecute = async (sql) => {
    // Check for parameters
    const params = extractParameters(sql)

    if (params.length > 0) {
      setCurrentSql(sql)
      setSqlParameters(params)
      setShowParamsModal(true)
      return
    }

    executeQuery(sql)
  }

  const executeQuery = async (sql) => {
    setError(null)
    setData(null)
    setHeaders(null)
    setFetching(true)

    const [results, error] = await run(sql, numRows)
    if (results) {
      setRows(results)
    }
    if (error) {
      setError(error)
      setFetching(false)
    }
  }

  const handleParameterExecute = (paramValues) => {
    const finalSql = replaceParameters(currentSql, paramValues)
    setShowParamsModal(false)
    executeQuery(finalSql)
  }

  const handleSuccess = (data) => {
    const [a, ...b] = data
    setSession(b)
    setConnected(a)
  }

  if (!connected && !showConnectionsManager) {
    return <Login onLoginSuccess={handleSuccess} onManageConnections={() => setShowConnectionsManager(true)} />
  }

  if (!connected && showConnectionsManager) {
    return <ConnectionsManager onClose={() => setShowConnectionsManager(false)} />
  }


  return (
    <div style={{ height: '100vh', overflow: "hidden" }} >
      <div className="content-center">
        <ProgressIndicator isOpen={fetching} />
      </div>
      <ParametersModal
        isOpen={showParamsModal}
        parameters={sqlParameters}
        onExecute={handleParameterExecute}
        onCancel={() => setShowParamsModal(false)}
      />
      <div style={{ padding: 0, margin: 0, border: 0, paddingLeft: "5px", width: '100vw' }}>
        <span className="w-2/3 inline-flex items-center" style={{ fontSize: '90%' }}>
          <button type="button" className="" onClick={() => {
            logout()
            setConnected(false)
          }}>
            <DisconnectIcon />
          </button>
          {session[1]}@{session[0]}
        </span>
      </div>
      <div style={{ padding: 0, margin: 0, border: 0, paddingLeft: "5px", width: '100vw' }}>
        <span className="w-2/3 inline-block" style={{ fontSize: '90%', fontWeight: '500', color: "darkblue" }}>
          Rows <input name="row" defaultValue={10} onChange={handleRowNumChange} style={{ width: '30px', padding: 0, margin: 0 }} />
        </span>
      </div>
      <SplitPane
        split='horizontal'
        sizes={sizes}
        onChange={setSizes}
      >
        <Pane  minSize='30%' maxSize='70%' >
          <Editor onExecute={onExecute} />

        </Pane>

        <Pane >
          < ResultPanel data={data}
            headers={headers}
            error={error}
            onComplete={() => {
              if (fetching)
                setFetching(false)
            }} />
        </Pane>
      </SplitPane>

    </div>
  );
}


