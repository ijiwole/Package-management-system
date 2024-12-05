const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/database');
const schema = require('./schemas/schema');
const resolvers = require('./resolvers/index')
require('dotenv').config();

async function startServer() {
    await connectDB();

    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.use((req, res, next) => {
        req.graphqlContext = req;
        next();
    });


    const server = new ApolloServer({
        typeDefs: schema,
        resolvers,
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return error;
        },
        context: ({req}) => req,
        introspection: true,
        playground: process.env.NODE_ENV !== 'production',
    });

    await server.start();

    server.applyMiddleware({ app, path: '/graphql' });

    app.get('/', (req, res) => {
        res.redirect('/graphql');
    });

    const port = process.env.PORT || 4000;
    const httpServer = http.createServer(app);
    httpServer.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    });
}

startServer().catch(console.error);
