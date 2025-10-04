import { useEffect, useRef, useState } from "react";
import { getStatement } from "./getStatement";
import { saveFile, openFile } from "../utils/api";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql'

const Editor = ({ onExecute }) => {
  const [text, setText] = useState("")
  const editorRef = useRef()
  const [scroll, setScroll] = useState(false)
  const [currentFilePath, setCurrentFilePath] = useState(null)

  useEffect(()=>{
      if (scroll)
        setScroll(false)
  },[scroll])

  const handleKeyDown = (event) => {
    if (event.key === 'F9') {
      const val = text
      const position = editorRef.current.view.viewState.state.selection.ranges[0].from
      const sql = getStatement(val, position)
      onExecute(sql)
    }

    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      handleSave()
    }

    // Ctrl+O or Cmd+O to open
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
      event.preventDefault()
      handleOpen()
    }
  }

  const handleSave = async () => {
    const result = await saveFile(text, currentFilePath)
    if (result.success) {
      setCurrentFilePath(result.filePath)
      alert('File saved successfully')
    } else if (result.error) {
      alert(`Error saving file: ${result.error}`)
    }
  }

  const handleOpen = async () => {
    const result = await openFile()
    if (result.success) {
      setText(result.content)
      setCurrentFilePath(result.filePath)
    } else if (result.error) {
      alert(`Error opening file: ${result.error}`)
    }
  }

  const Dummy = () =>{
    //this is a workaround for the scrollbar bug
    //that i have no idea how to fix properly
    if (scroll){
      return <p style={{height: "1px", padding: 0, margin: 0, border: 'none' }}>,</p>
    }else
      return <p style={{height: "1px" , padding: 0, margin: 0, border: 'none'}}>.</p>
  }

  const handleChange = (editor) => {
    setText(editor)
  }

  const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
    </svg>
  )

  const OpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    </svg>
  )

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', padding: '4px', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
        <button
          onClick={handleOpen}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          title="Open File (Ctrl+O)"
        >
          <OpenIcon /> Open
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 bg-green-500 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
          title="Save File (Ctrl+S)"
        >
          <SaveIcon /> Save
        </button>
        {currentFilePath && (
          <span className="text-xs text-gray-600 flex items-center ml-2">
            {currentFilePath}
          </span>
        )}
      </div>
      <Dummy/>
      <CodeMirror
        ref={editorRef}
        extensions={[sql()]}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        autoFocus={true}
        onScroll={()=> setScroll(true)}
        style={{overflow: 'auto',height:"calc(100% - 35px)"}}
      />
    </>
  );
}

export default Editor