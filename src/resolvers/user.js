const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { compare } = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { GraphQLError } = require("graphql");

const resolvers = {
    Mutation: {
        register: async (_, { username, password, role}) => {
            if (!username || !password|| !role) {
                throw new GraphQLError('All fields are required', {
                    extensions:{
                        code: 'BAD_REQUEST',
                    }
                });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                throw new GraphQLError('Username is already taken', {
                    extensions:{
                        code: 'BAD_REQUEST',
                    }
                });
            }

            const user = new User({ username, password, role });
            await user.save();

           const token = generateToken(user._id, user.role);

            return { token, user };
        },

        login: async (_, { username, password }) => {

            if (!username || !password) {
                throw new GraphQLError('Username and password are required', {
                    extensions:{
                        code: 'BAD_REQUEST',
                    }
                });
            }

            const user = await User.findOne({ username });

            if (!user) throw new GraphQLError('User not found', {
                extensions:{
                    code: 'NOT_FOUND',
                }
            });

            const isMatch = await compare(password, user.password);
            if (!isMatch) throw new GraphQLError('Incorrect password', {
                extensions:{
                    code: 'BAD_USER_INPUT',
                }
            });

            const token = generateToken(user._id, user.role);

            return {token,
                user:{
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
             };
        }
    },

    Query:{
        user: async (_, { id }) => {
            if(!id) {
                throw new GraphQLError('UserId is required', {
                    extensions: {
                        code: 'BAD_REQUEST',
                    }
                })
            }
            const user = await User.findById(id);
            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions:{
                        code: 'NOT_FOUND',
                    }
                })
            }
            return user;
        }
    }
};

module.exports = resolvers;
