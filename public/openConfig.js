const fs = require('fs').promises;

const readConf = async (p) => {
    try{
        const data = await fs.readFile(p, 'utf8')
        return data;
    }catch(err){
        console.log(err);
        return JSON.stringify({ connections: [] });
    }
}

module.exports = readConf