const pgPromise = require('pg-promise')

const config = {
    host: 'localhost',
    port: '5433',
    database: 'pizzas',
    user: 'postgres',
    password: 'Salsa123'
}

const pgp = pgPromise({})
const db = pgp(config)

exports.db = db