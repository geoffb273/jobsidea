import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from '@apollo/server/standalone'
import resolvers from "./schema/resolvers"
import { loadFiles } from '@graphql-tools/load-files'
import dotenv from 'dotenv'
import { connect } from "./models/database"


dotenv.config()
loadFiles("./schema/typeDefs.graphql").then(typeDefs => {
    const server = new ApolloServer({typeDefs, resolvers})

    startStandaloneServer(server, { listen : { port: 8000 } }).then(({url}) => {
        console.log(`Listening at ${url}`)
        connect()
    })
})

