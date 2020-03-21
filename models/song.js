const {BaseDao, init} = require('./interfaces/base')

init()

class Song extends BaseDao {
  constructor (dados) {
    super('song')
    if (!dados) return;
    this.id = (dados._id || '')
    this.code = (dados.code || '')
    this.downloaded = (dados.downloaded || false)
    this.broken = (dados.broken || false)
    this.liked = (dados.liked || false)
    this.disliked = (dados.disliked || false)
    this.title = (dados.title || '')
    this.url = (dados.url || '')

    if (this.url.length > 0 && this.code.length === 0) {
      this.code = this.url.substring(this.url.indexOf("watch?v=") + 8, this.url.length)
    }
  }
}

module.exports = Song
