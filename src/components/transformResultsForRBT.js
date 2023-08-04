const reducer = (acc, item, i) => {
  if (!!!item.elements) item.elements = [{ text: "" }]
  return { ...acc, [item.name]: item.elements[0].text }
}

export default function transformResultsForRBT(rows, setHeaders, setData) {
  let tempData = [];
  if (rows && rows.length > 0) {
    const h = rows[0].elements.map((item, index) => ({
      field: item.name,
      // label: item.name,
      // key: item.name,
    }))
    setHeaders(h);
    rows.forEach(att => {
      tempData.push(att.elements.reduce(reducer, {}));
    });
  }
  setData(tempData);
}
