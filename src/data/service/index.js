const axios = require('axios')

const encode = (str) => {
   return Buffer.from(str, 'utf8').toString('base64')
}//encode

const call = (url, xml, headers = {
   'Content-Type': 'text/xml;charset=UTF-8',
   'SOAPAction': '""'
}) => {
   process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
   const ret  =  axios.post(url, xml, { headers })
   return ret
}//call

const createDataModelService = (baseUrl, user, password, headers) => {
   const url = `${baseUrl}/xmlpserver/services/v2/CatalogService`
   const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://xmlns.oracle.com/oxp/service/v2">
    <soapenv:Header/>
    <soapenv:Body>
       <v2:createObject>
          <v2:folderAbsolutePathURL>/Custom/OASQLTool</v2:folderAbsolutePathURL>
          <v2:objectName>OASqlTool</v2:objectName>
          <v2:objectType>xdm</v2:objectType>
          <v2:objectDescription>Dyamic Model</v2:objectDescription>
          <v2:objectData>PD94bWwgdmVyc2lvbiA9ICcxLjAnIGVuY29kaW5nID0gJ3V0Zi04Jz8+DQo8ZGF0YU1vZGVsIHhtbG5zPSJodHRwOi8veG1sbnMub3JhY2xlLmNvbS9veHAveG1scCIgdmVyc2lvbj0iMi4wIiB4bWxuczp4ZG09Imh0dHA6Ly94bWxucy5vcmFjbGUuY29tL294cC94bWxwIiB4bWxuczp4c2Q9Imh0dHA6Ly93d3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgZGVmYXVsdERhdGFTb3VyY2VSZWY9IkFwcGxpY2F0aW9uREJfSENNIj4NCiAgIDxkYXRhUHJvcGVydGllcz4NCiAgICAgIDxwcm9wZXJ0eSBuYW1lPSJpbmNsdWRlX3BhcmFtZXRlcnMiIHZhbHVlPSJ0cnVlIi8+DQogICAgICA8cHJvcGVydHkgbmFtZT0iaW5jbHVkZV9udWxsX0VsZW1lbnQiIHZhbHVlPSJ0cnVlIi8+DQogICAgICA8cHJvcGVydHkgbmFtZT0iaW5jbHVkZV9yb3dzZXR0YWciIHZhbHVlPSJmYWxzZSIvPg0KICAgICAgPHByb3BlcnR5IG5hbWU9ImV4Y2x1ZGVfdGFnc19mb3JfbG9iIiB2YWx1ZT0iZmFsc2UiLz4NCiAgICAgIDxwcm9wZXJ0eSBuYW1lPSJFWENMVURFX0xJTkVfRkVFRF9BTkRfQ0FSUklBR0VfUkVUVVJOX0ZPUl9MT0IiIHZhbHVlPSJmYWxzZSIvPg0KICAgICAgPHByb3BlcnR5IG5hbWU9InhtbF90YWdfY2FzZSIgdmFsdWU9InVwcGVyIi8+DQogICAgICA8cHJvcGVydHkgbmFtZT0iZ2VuZXJhdGVfb3V0cHV0X2Zvcm1hdCIgdmFsdWU9InhtbCIvPg0KICAgICAgPHByb3BlcnR5IG5hbWU9Im9wdGltaXplX3F1ZXJ5X2V4ZWN1dGlvbnMiIHZhbHVlPSJmYWxzZSIvPg0KICAgICAgPHByb3BlcnR5IG5hbWU9ImVuYWJsZV94bWxfY2h1bmtzIiB2YWx1ZT0iIi8+DQogICAgICA8cHJvcGVydHkgbmFtZT0ic3FsX21vbml0b3JfcmVwb3J0X2dlbmVyYXRlZCIgdmFsdWU9ImZhbHNlIi8+DQogICA8L2RhdGFQcm9wZXJ0aWVzPg0KICAgPGRhdGFTZXRzPg0KICAgICAgPGRhdGFTZXQgbmFtZT0iUTEiIHR5cGU9InNpbXBsZSI+DQogICAgICAgICA8c3FsIG5zUXVlcnk9InRydWUiIHNwPSJ0cnVlIiB4bWxSb3dUYWdOYW1lPSIiIGJpbmRNdWx0aVZhbHVlQXNDb21tYVNlcFN0cj0iZmFsc2UiPg0KICAgICAgICAgICAgPCFbQ0RBVEFbREVDTEFSRQ0KdHlwZSByZWZjdXJzb3IgaXMgUkVGIENVUlNPUjsNCnJlc3VsdHMgcmVmY3Vyc29yOw0KQkVHSU4NCk9QRU4gOnJlc3VsdHMgRk9SICdzZWxlY3QgKiBmcm9tICgnfHx1dGxfcmF3LmNhc3RfdG9fdmFyY2hhcjIgKHV0bF9lbmNvZGUuYmFzZTY0X2RlY29kZShVVExfUkFXLkNBU1RfVE9fUkFXKDpxdWVyeSkpKXx8Jykgd2hlcmUgcm93bnVtIDw9ICd8fDpyb3dzOw0KRU5EO11dPg0KICAgICAgICAgPC9zcWw+DQogICAgICA8L2RhdGFTZXQ+DQogICA8L2RhdGFTZXRzPg0KICAgPG91dHB1dCByb290TmFtZT0iUkVTVUxUUyIgdW5pcXVlUm93TmFtZT0iZmFsc2UiPg0KICAgICAgPG5vZGVMaXN0IG5hbWU9IlExIi8+DQogICA8L291dHB1dD4NCiAgIDxldmVudFRyaWdnZXJzLz4NCiAgIDxsZXhpY2Fscy8+DQogICA8cGFyYW1ldGVycz4NCiAgICAgIDxwYXJhbWV0ZXIgbmFtZT0icm93cyIgZGVmYXVsdFZhbHVlPSIxMDAiIGRhdGFUeXBlPSJ4c2Q6c3RyaW5nIiByb3dQbGFjZW1lbnQ9IjEiPg0KICAgICAgICAgPGlucHV0Lz4NCiAgICAgIDwvcGFyYW1ldGVyPg0KICAgICAgPHBhcmFtZXRlciBuYW1lPSJyZXN1bHRzIiBkYXRhVHlwZT0ieHNkOnN0cmluZyIgcm93UGxhY2VtZW50PSIxIj4NCiAgICAgICAgIDxpbnB1dC8+DQogICAgICA8L3BhcmFtZXRlcj4NCiAgICAgIDxwYXJhbWV0ZXIgbmFtZT0icXVlcnkiIGRhdGFUeXBlPSJ4c2Q6c3RyaW5nIiByb3dQbGFjZW1lbnQ9IjEiPg0KICAgICAgICAgPGlucHV0IGxhYmVsPSJRdWVyeSIvPg0KICAgICAgPC9wYXJhbWV0ZXI+DQogICA8L3BhcmFtZXRlcnM+DQogICA8dmFsdWVTZXRzLz4NCiAgIDxidXJzdGluZy8+DQogICA8dmFsaWRhdGlvbnM+DQogICAgICA8dmFsaWRhdGlvbj5OPC92YWxpZGF0aW9uPg0KICAgPC92YWxpZGF0aW9ucz4NCiAgIDxkaXNwbGF5Pg0KICAgICAgPGxheW91dHM+DQogICAgICAgICA8bGF5b3V0IG5hbWU9IlExIiBsZWZ0PSIyMDBweCIgdG9wPSIzNDJweCIvPg0KICAgICAgICAgPGxheW91dCBuYW1lPSJEQVRBX0RTIiBsZWZ0PSI1cHgiIHRvcD0iMzQycHgiLz4NCiAgICAgIDwvbGF5b3V0cz4NCiAgICAgIDxncm91cExpbmtzLz4NCiAgIDwvZGlzcGxheT4NCjwvZGF0YU1vZGVsPg==
          </v2:objectData>
          <v2:userID>${user}</v2:userID>
          <v2:password>${password}</v2:password>
       </v2:createObject>
    </soapenv:Body>
 </soapenv:Envelope>`

 return call(url, xml)
}//createDataModel

const modelExistsService = (baseUrl, user, password, headers) => {

   const url = `${baseUrl}/xmlpserver/services/v2/CatalogService`
   const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://xmlns.oracle.com/oxp/service/v2">
                  <soapenv:Header/>
                  <soapenv:Body>
                     <v2:objectExist>
                        <v2:reportObjectAbsolutePath>/Custom/OASQLTool</v2:reportObjectAbsolutePath>
                        <v2:userID>${user}</v2:userID>
                        <v2:password>${password}</v2:password>
                     </v2:objectExist>
                  </soapenv:Body>
               </soapenv:Envelope>`

   return call(url, xml)

}//modelExists

const runSqlService = async (baseUrl, user, password, sql, rows = 10, headers) => {
   const url = `${baseUrl}/xmlpserver/services/v2/ReportService`
   const encSql = encode(sql)
   const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://xmlns.oracle.com/oxp/service/v2">
  <soapenv:Header/>
  <soapenv:Body>
     <v2:runDataModel>
        <v2:reportRequest>
           <v2:byPassCache>True</v2:byPassCache>
           <v2:flattenXML>True</v2:flattenXML>
           <v2:reportAbsolutePath>/Custom/OASQLTool/OASqlTool.xdm</v2:reportAbsolutePath>
           <v2:sizeOfDataChunkDownload>-1</v2:sizeOfDataChunkDownload>
           <v2:parameterNameValues>
              <v2:listOfParamNameValues>
                 <v2:item>
                    <v2:name>query</v2:name>
                    <v2:values>
                       <v2:item>${encSql}</v2:item>
                    </v2:values>
                 </v2:item>
                 <v2:item>
                    <v2:name>rows</v2:name>
                    <v2:values>
                       <v2:item>${rows}</v2:item>
                    </v2:values>
                 </v2:item>                  
              </v2:listOfParamNameValues>
           </v2:parameterNameValues>
        </v2:reportRequest>
        <v2:userID>${user}	</v2:userID>
        <v2:password>${password}</v2:password>
     </v2:runDataModel>
  </soapenv:Body>
</soapenv:Envelope>`

   return call(url, xml)
}//runSql

// const tester = async () => {

//    try {

//       const ret = await modelExistsService('https://eltf.fa.us2.oraclecloud.com', 'oscar.abeleda@alsglobal.com', 'Oracle1234')
//       // const ret = await modelExistsService('https://eltf.fa.us2.oraclecloud.com', 'oscar.abeleda@alsglobal.com', 'Oracle123','select person_idx from per_people_x where rownum < 3')
//       //   console.log(Object.keys(ret))

//    } catch (err) {
//       if (err.response) {
//          console.log(Object.keys(err.response));
//          console.log(err.response.statusText)
//       } else if (err.request) {
//          // The client never received a response, and the request was never left
//          console.log(Object.keys(err.cause))
//          console.log(err.cause);
//       } else {
//          // Anything else
//       }
//    }
//    // console.log(ret)
// }

// tester()
module.exports = { modelExistsService, createDataModelService, runSqlService }


