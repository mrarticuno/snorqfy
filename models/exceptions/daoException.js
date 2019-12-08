module.exports.DaoException = class DaoException {
  constructor (message) {
    this.message = message
    this.name = 'DaoException'
  }
}
  