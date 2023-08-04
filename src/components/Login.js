import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react"
import { getConnections, login } from "../utils/api";

export const Login = ({ onLoginSuccess }) => {

    const urlRef = useRef(null);
    const usrRef = useRef(null);
    const pwdRef = useRef(null);

    const [connections, setConnections] = useState([])
    const columnDefs = [
    { field: 'username', headerName: "User" },
    { field: 'url', headerName: "URL" },
    ]

    useEffect(() => {
        const getC = async () => {
            const d = await getConnections()
            setConnections(JSON.parse(d).connections)
        }
        getC()
    }, [])


    const handleLogin = async () => {


        if (!urlRef.current.value || !usrRef.current.value || !pwdRef.current.value)
            alert("please fill in all the fields")
        else {
            const [response, error] = await login(urlRef.current.value, usrRef.current.value, pwdRef.current.value)
            if (error) alert(error)
            if (response) onLoginSuccess([true, urlRef.current.value, usrRef.current.value, pwdRef.current.value])
        }
    }

    const handleClicked = ({ data }) => {
        urlRef.current.value = data.url
        usrRef.current.value = data.username
        pwdRef.current.value = data.password
    }

    const defaultColDef ={
        flex: 1
    }

    return (
        <div className="flex mb4">
            <div className="w-1/3 p-2" >
                <label className="login-input-label " > Url </label>
                <input className="login-input-text" ref={urlRef} type="text" name="url" />

                <label className="login-input-label" >User </label>
                <input className="login-input-text w-full" ref={usrRef} type="text" name="username" />

                <label className="login-input-label" >Password</label>
                <input className="login-input-text w-full" ref={pwdRef} type="password" name="password" />

                <div className="flex justify-center p-0">
                    <button className=" bg-indigo-400 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogin}>
                        Connect
                    </button>
                </div>

            </div>
            <div className="w-2/3 px-2">
                <div className="ag-theme-alpine" style={{ height: "100vh", width: '100%' }} >
                    <AgGridReact
                        defaultColDef={defaultColDef}
                        onRowClicked={handleClicked}
                        rowData={connections}
                        columnDefs={columnDefs}>

                    </AgGridReact>
                </div>
            </div>

        </div >)

}