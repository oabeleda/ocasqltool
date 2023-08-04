import ResultsTable from './ResultsTable'

const ResultPanel = ({ data, headers, error, onComplete }) => {

  if (error) return <div style={{padding: '10px'}}>{error}</div>
  if (data && data.length > 0) {
    return (
      <ResultsTable headers={headers} data={data} onGridReady={onComplete} />
    )
  }
  else if (data && data.length === 0) {
    onComplete()
    return (<pre style={{padding: '10px'}}>No rows returned</pre>)
  }

}


export default ResultPanel