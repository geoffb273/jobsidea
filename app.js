import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from '@apollo/server/standalone'
import resolvers from "./schema/resolvers.js"
import { loadFiles } from '@graphql-tools/load-files'
import dotenv from 'dotenv'
import db from "./models/database.js"
dotenv.config()
const typeDefs = await loadFiles("./schema/typeDefs.graphql")
const server = new ApolloServer({typeDefs, resolvers})

startStandaloneServer(server, { listen : { port: 8000 } }).then(({url}) => {
    console.log(`Listening at ${url}`)
    db.connect()
})