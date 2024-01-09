const { ApolloServer } = require('apollo-server')
const { fileLoader, mergeTypes,  } = require('merge-graphql-schemas')

const typeDefs = mergeTypes(fileLoader('./type-system/schema.graphql'))
const resolvers = require('./controllers/pizza.controller')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen(4000).then(({ url }) => {
    console.log(`🚀  Server running in the URL: ${url}`)
})