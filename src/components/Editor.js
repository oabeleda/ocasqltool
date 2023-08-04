import { useEffect, useRef, useState } from "react";
import { getStatement } from "./getStatement";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql'

const Editor = ({ onExecute }) => {
  const [text, setText] = useState("")
  const editorRef = useRef()
  const [scroll, setScroll] = useState(false)

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

  return (
    <>
   <Dummy/>
      <CodeMirror
        ref={editorRef}
        extensions={[sql()]}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        autoFocus={true}
        onScroll={()=> setScroll(true)}
        style={{overflow: 'auto',height:"100%"}}
      />
    </>
  );
}

export default Editor