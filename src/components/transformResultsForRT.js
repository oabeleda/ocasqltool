const reducer = (acc, item, i) => {
  if (!!!item.elements) item.elements = [{ text: "" }]
  return { ...acc, [`col${i + 1}`]: item.elements[0].text }
}

export default function transformResultsForRT(rows, setHeaders,  setData) {
  let tempData = [];
  if (rows && rows.length > 0) {
    setHeaders(rows[0].elements.map((item, index) => ({ "Header": item.name, "accessor": `col${index + 1}` })));
    rows.forEach(att => {
      tempData.push(att.elements.reduce(reducer, {}));
    });
  }
  setData(tempData);
}
