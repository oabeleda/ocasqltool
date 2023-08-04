const { runSqlService, createDataModelService, modelExistsService } = require("../service")
const parser = require('xml-js');

const decode = (str) => {
    return Buffer.from(str, 'base64').toString('utf8')
}//encode

let session = {}

const login = (url, user, password) => {
    session = { url: url, user: user, password: password }
}

const logout = () => {
    session = {}
}

const getSession = () => {
    return session
}

const resolve = async (promise) => {
    let results = null, error = null
    try {
        results = await promise
    } catch (err) {
        if (err.response) {
            const parsedData = JSON.parse(parser.xml2json(err.response.data))
            if (parsedData.elements[0].elements[0].elements[0]){
                error = parsedData.elements[0].elements[0].elements[0].elements[1].elements[0].text
            }
            else
                error = parsedData
        } else if (err.request) {
            error = err.cause.code
        } else {
            error = new Error(`Unknown Error: ${err.code}`)
        }
    }
    return [results, error]
}

const runSql = async (sql, rows) => {
    const { url, user, password } = session
    const [results, error] = await resolve(runSqlService(url, user, password, sql, rows))

    if (!!!error) {
        const body = JSON.parse(parser.xml2json(results.data))
        const records = decode(body.elements[0].elements[0].elements[0].elements[0].elements[1].elements[0].text)
        const jsrecs = JSON.parse(parser.xml2json(records)).elements[1].elements
        jsrecs.shift()
        jsrecs.shift()
        jsrecs.shift()
        return [jsrecs, null]
    } else {
        return [null, error]
    }
}

const createDataModel = async () => {
    const { url, user, password } = session
    const [_, error] = await resolve(createDataModelService(url, user, password))
    if (!!!error) {
        return ["Success", null]
    } else {
        return [null, error]
    }
}

const modelExists = async () => {
    const { url, user, password } = session
    const [results, error] = await resolve(modelExistsService(url, user, password))

    if (!!!error) {
        const body = JSON.parse(parser.xml2json(results.data))
        return [body.elements[0].elements[0].elements[0].elements[0].elements[0].text, null]
    } else {
        return [null, error]
    }
}


module.exports = { login, logout, runSql, createDataModel, modelExists, getSession }
