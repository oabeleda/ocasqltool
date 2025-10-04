export const getStatement = (text, position) => {
  // const reversed = [...text.substr(0, position)].reverse().join("");

  // let nlPos1 = reversed.search(/^$/m);
  // const stmtStart = nlPos1 === -1 ? 0 : position - nlPos1;

  // let nlPos2 = text.substring(stmtStart+1).search(/^$|^\s+$/m);
  // const stmtEnd = nlPos2 === -1 ? text.length : nlPos2 + stmtStart + 1;

  // return text.substring(stmtStart, stmtEnd);


const reversed = [...text.substr(0, position)].reverse().join("");

let nlPos1 = reversed.search(/\n/);
const stmtStart = nlPos1 === -1 ? 0 : position - nlPos1;

let nlPos2 = text.substring(stmtStart).search(/\n/);
const stmtEnd = nlPos2 === -1 ? text.length : nlPos2 + stmtStart;

return text.substring(stmtStart, stmtEnd);
};
