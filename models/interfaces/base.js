const DaoException = require('../exceptions/daoException');

const uuidv1 = require('uuid/v1');
const PouchDB = require('pouchdb-node')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-adapter-node-websql'))


let BaseDao

const init = () => {
  if (BaseDao) return

  BaseDao = class BaseDao {
    constructor (model) {
      this.model = model
      this.db = new PouchDB('db/' + model + '.db', { adapter: 'websql' })
    }

    raw () {
      const { db, model, ...rawobj } = this
      return rawobj
    }

    save () {
      return new Promise((resolve, reject) => {
        try {
          if (this.id === null || this.id === '' || this.id.length === 0) {
            this.id = uuidv1()
            // EventBus.$emit('log', { op: 'save', act: 'insert', bo: this.model, obj: this.raw() })
            this.db.put(Object.assign({ _id: this.id }, this.raw())).then(ret => {
              resolve(ret)
            })
          } else {
            this.db.get(this.id).catch(function (err) {
              if (err.name === 'not_found') {
                throw new DaoException('Objeto não encontrado no banco de dados')
              } else {
                throw err
              }
            }).then(doc => {
            //   EventBus.$emit('log', { op: 'save', act: 'update', bo: this.model, obj: this.raw() })
              this.db.put(Object.assign({ _id: this.id }, { _rev: doc._rev }, this.raw())).then(ret => {
                resolve(ret)
              })
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    saveAll (list) {
      return new Promise((resolve, reject) => {
        try {
          if (list == null || list === '' || list.length === 0) {
            throw new DaoException('Lista não pode estar vazia')
          } else {
            this.db.bulkDocs(list).then(doc => {
            //   EventBus.$emit('log', { op: 'save', act: 'batchInsert', bo: this.model, obj: 'array' })
              resolve(doc)
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    delete () {
      return new Promise((resolve, reject) => {
        try {
          if (this.id == null || this.id === '' || this.id.length === 0) {
            throw new DaoException('Identificador não pode ser vazio para deletar')
          } else {
            this.db.get(this.id).then(doc => {
            //   EventBus.$emit('log', { op: 'remove', act: 'delete', bo: this.model, obj: this.raw() })
              this.db.remove(doc).then(ret => {
                resolve(ret)
              })
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    find (selector) {
      return new Promise((resolve, reject) => {
        try {
          this.db.find(selector).catch(function (err) {
            if (err.name === 'not_found') {
              throw new DaoException('Nenhum Objeto Encontrado')
            } else {
              throw err
            }
          }).then(doc => {
            // EventBus.$emit('log', { op: 'get', act: 'find', bo: this.model, obj: selector })
            resolve(doc.docs)
          })
        } catch (err) {
          reject(err)
        }
      })
    }

    get (id) {
      if (id !== null && id !== undefined) {
        this.id = id
      }
      return new Promise((resolve, reject) => {
        try {
          if (this.id == null || this.id === '' || this.id.length === 0) {
            throw new DaoException('Informe o ID para buscar o objeto')
          } else {
            this.db.get(this.id).catch(function (err) {
              if (err.name === 'not_found') {
                throw new DaoException('Objeto não encontrado no banco de dados')
              } else {
                throw err
              }
            }).then(doc => {
            //   EventBus.$emit('log', { op: 'get', act: 'id', bo: this.model, obj: this.id })
              resolve(doc)
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    all (limit, skip) {
      return new Promise((resolve, reject) => {
        try {
          this.db.find({
            selector: {},
            limit: limit,
            skip: skip
          }).catch(function (err) {
            if (err.name === 'not_found') {
              throw new DaoException('Nenhum Objeto Encontrado')
            } else {
              throw err
            }
          }).then(doc => {
            // EventBus.$emit('log', { op: 'get', act: 'all', bo: this.model, obj: null })
            resolve(doc.docs)
          })
        } catch (err) {
          reject(err)
        }
      })
    }
  }
}

init()

module.exports.BaseDao = BaseDao
module.exports.init = init
