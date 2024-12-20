const userResolvers = require('../resolvers/user');
const packageResolvers = require('../resolvers/package');

const resolvers = {
    Mutation: {
        ...userResolvers.Mutation,
        ...packageResolvers.Mutation,
    },
    Query: {
        ...userResolvers.Query,
        ...packageResolvers.Query
    }
}

module.exports = resolvers;