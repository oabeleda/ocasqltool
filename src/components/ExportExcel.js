import XLSX from 'sheetjs-style';

const ExportExcel = ({ excelData }) => {

  const exportToExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
    XLSX.writeFile(workbook, "Book1.xlsx", { compression: true });
  }

  return (
    <div >
      <button type='button' className='bg-blue-500 hover:bg-blue-700 text-white px-2 ' onClick={()=>exportToExcel()}>Export</button>
    </div>
  )
}


export default ExportExcel