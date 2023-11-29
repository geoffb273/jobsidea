import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadFiles } from '@graphql-tools/load-files';
import dotenv from 'dotenv';

import { connect } from './models/database';
import resolvers from './schema/resolvers';

dotenv.config();
void loadFiles('./schema/typeDefs.graphql').then(typeDefs => {
  const server = new ApolloServer({ typeDefs, resolvers });

  void startStandaloneServer(server, { listen: { port: 8000 } }).then(
    ({ url }) => {
      console.log(`Listening at ${url}`);
      void connect();
    },
  );
});
