const { gql } = require('apollo-server');

module.exports = gql`
  type Package {
    id: ID!
    name: String!
    description: String!
    price: Float!
    expirationDate: String!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    username: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    USER
    ADMIN
  }

  type Query {
    user(id: ID!): User
    packages(filterByDate: String): [Package]
    package(id: ID!): Package
    me: User!
  }

  type Mutation {
    register(
      username: String!
      password: String!
      role: Role = USER
    ): AuthPayload!
    
    login(
      username: String!
      password: String!
    ): AuthPayload!
    
    createPackage(
      name: String!
      description: String!
      price: Float!
      expirationDate: String!
    ): Package!
    
    updatePackage(
      id: ID!
      name: String
      description: String
      price: Float
      expirationDate: String
    ): Package!

    deletePackage(id: ID!): Boolean!
  }
`;
