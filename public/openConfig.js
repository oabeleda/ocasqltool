const fs = require('fs').promises;

const readConf = async (p) => {
    try{
        const data = fs.readFile(p, 'utf8')
        return data;
    }catch(err){
        return console.log(err);
    }
}

module.exports = readConf