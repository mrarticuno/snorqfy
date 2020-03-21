const {BaseDao, init} = require('./interfaces/base')

init()

class ListenQueue extends BaseDao {
  constructor (dados) {
    super('listenqueue')
    if (!dados) return;
    this.id = (dados._id || '')
    this.url = (dados.url || '')
    this.songs = (dados.songs || [])
    this.listened = (dados.listened || [])
  }
}

module.exports = ListenQueue
