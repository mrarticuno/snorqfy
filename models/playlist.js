const {BaseDao, init} = require('./interfaces/base')

init()

class Playlist extends BaseDao {
  constructor (dados) {
    super('playlist')
    if (!dados) return;
    this.id = (dados._id || '')
    this.favorite = (dados.favorite || false)
    this.url = (dados.url || '')
    this.songs = (dados.songs || [])
  }
}

module.exports = Playlist
