import express from 'express';
import { createServer } from 'http';
import { PubSub } from 'apollo-server';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

const pubsub = new PubSub();
const MESSAGE_CREATED = 'MESSAGE_CREATED';

const typeDefs = gql`

    type Query {
        getString(id: String): String
    }

    type Mutation {
        createEvent(input: NewEvent): OutEvent
    }

    type Subscription {
        message: OutEvent
    }

    input NewEvent {
        type: String
        userId: String
        content: Content
    }
    
    input Content {
        platform: String
        contact: String
        message: String
    }
  
    type OutEvent {
        type: String
        userId: String
        content: ContentOut
    }
    
    type ContentOut {
        platform: String
        contact: String
        message: String
    }
    
    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;


const resolvers = {
    Query: {
        getString: async (parent, { id }, context) => {
            return id
        },
    },
    Mutation: {
        createEvent: async (parent, { input }, context) => {
            console.log('input',input);
            await pubsub.publish(MESSAGE_CREATED,  { message: input });
            return input;
        },

    },
    Subscription: {
        message: {
            subscribe: () => pubsub.asyncIterator(MESSAGE_CREATED),
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  server.applyMiddleware({ app, path: '/query' });

  const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 3000 }, () => {
  console.log('Apollo Server on http://localhost:3000/query');
});

