
export const login = async ( url, user, password) => await window.electronAPI.login({ url: url, user: user, password: password})
export const run = async (sql, rows) => await window.electronAPI.run({ sql: sql, rows: rows})
export const isConnected =  async () =>  await  window.electronAPI.isConnected()
export const getConnections =  async () =>  await  window.electronAPI.getConnections()
export const logout =  async () =>  await  window.electronAPI.logout()