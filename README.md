# Package Management System

## Description
A Node.js-based package management system that leverages GraphQL for API interactions and MongoDB as the database. This system enables users to perform comprehensive CRUD operations on packages with robust role-based access control and secure authentication.

## Project Overview
- **Timeline**: 48 hours
- **Objective**: Build a package management system with CRUD operations and secure authentication

## Features
- **CRUD Operations**: 
  - Create new packages
  - Read and list existing packages
  - Update package details
  - Delete packages
- **Authentication**: 
  - JWT-based secure authentication
  - Protected API endpoints
- **Role-based Access Control**: 
  - Granular permissions for package management
  - Restrict update and delete operations to authorized users

## Tech Stack
- **Backend**: Node.js
- **API**: GraphQL
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)

## Prerequisites
- Node.js (v14+ recommended)
- npm
- MongoDB (Local or Cloud instance)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ijiwole/Package-management-system.git
cd Package-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
PORT=3000
```

### 4. Run the Application
**Development Mode**:
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

## GraphQL API Documentation

### Authentication Endpoints

#### User Registration
```graphql
mutation RegisterUser {
  register(
    username: String!
    email: String!
    password: String!
    role: UserRole
  ) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

#### User Login
```graphql
mutation Login {
  login(
    email: String!
    password: String!
  ) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

### Package Endpoints

#### Create a Package
```graphql
mutation {
  createPackage(
    name: "Test",
    description: "This is the premium package with extra features",
    price: 1000,
    expirationDate: "2024-12-31"
  ) {
    id
    name
    description
    price
    expirationDate
    createdBy {
      id
      username
    }
  }
}
```

#### Query Pacakges By Date 
```graphql
query GetPackages {
  query {
  packages(filterByDate: "2024-12-31") {
    id
    name
    description
    expirationDate
    createdBy {
      id
      username
    }
  }
}
}
```

#### Get Single Package
```graphql
query GetPackage {
  package(id: "675155a97d33b878c033c978") {
    id  
    name
    description
    expirationDate
  }
}
```

#### Update Package
```graphql
mutation UpdatePackage {
  updatePackage(id: "67514885a36681bbfb26e317", name: "Updated Plan", description: "New description", price: 120) {
    id
    name
    description
    price
  }
}
```

#### Delete Package
```graphql
mutation DeletePackage {
  deletePackage(id: ID!) {
    success
    message
  }
}
```

### Error Handling
The API returns user-friendly error messages with the following structure:
```graphql
{
  "errors": [
    {
      "message": "Detailed error description",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

## Authentication & Authorization
- JWT tokens are required for update and delete operations
- Include the token in the `Authorization` header:
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- Different user roles have different access levels

## Security Features
- Secure password hashing
- JWT token-based authentication
- Role-based access control
- Protected GraphQL mutations

## Development Notes
- Implements role-based access control
- Admin users have full package management capabilities
- Authenticated users can perform CRUD operations based on their role

## Troubleshooting
- Ensure MongoDB is running
- Verify `.env` configuration
- Check network connectivity
- Validate JWT token for authenticated requests

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Evaluation Criteria
- Code quality
- Authentication implementation
- CRUD operation functionality
- Documentation
- Ease of setup

## License
ISC

## Contact
- Project Repository: https://github.com/ijiwole/Package-management-system