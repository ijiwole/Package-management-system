const { GraphQLError } = require('graphql');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const Package = require('../models/package');
const User = require('../models/user');
const AuthRoles = require('../utils/authRoles')

const resolvers = {
  Mutation: {
    createPackage: async (_, { name, description, price, expirationDate }, req) => {
      if (!req || !req.headers) {
        throw new GraphQLError("Request object is not available or headers are missing", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
          throw new GraphQLError("Not authenticated", {
            extensions: {
              code: "UNAUTHORIZED",
            },
          });
        }

        if (!name || !description || !price || !expirationDate) {
          throw new GraphQLError("All fields are required", {
            extensions: {
              code: "BAD_REQUEST",
            },
          });
        }

        if (isNaN(price) || price <= 0) {
          throw new GraphQLError("Price must be a valid positive number", {
            extensions: {
              code: "BAD_REQUEST",
            },
          });
        }

        if (!moment(expirationDate, "YYYY-MM-DD", true).isValid()) {
          throw new GraphQLError("Invalid expiration date format. Expected format is YYYY-MM-DD", {
            extensions: {
              code: "BAD_REQUEST",
            },
          });
        }

        const newPackage = new Package({
          name,
          description,
          price,
          expirationDate,
          createdBy: user._id, 
        });

        await newPackage.save();

        await newPackage.populate('createdBy')

        return newPackage;
      } catch (error) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }
    },

    updatePackage: async (_, { id, name, description, price }, req) => {

      const authHeader = req.headers.authorization;
      if (!authHeader) {
          throw new GraphQLError("Not authenticated", {
              extensions: { code: "UNAUTHORIZED" },
          });
      }
  
      const token = authHeader.split(' ')[1];
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);
  
          if (!user) {
              throw new GraphQLError("Not authenticated", {
                  extensions: { code: "UNAUTHORIZED" },
              });
          }
          if (user.role !== AuthRoles.ADMIN) {
            throw new GraphQLError("Forbidden: Only admins can update packages", {
              extensions: {
                code: "FORBIDDEN",
              },
            });
          }
  
          const packageToUpdate = await Package.findById(id);
          if (!packageToUpdate) {
              throw new GraphQLError(`Package with id ${id} does not exist`, {
                  extensions: { code: "NOT_FOUND" },
              });
          }
  
          if (name) packageToUpdate.name = name.trim();
          if (description) packageToUpdate.description = description.trim();
  
          if (price !== undefined) {
              if (isNaN(price) || price <= 0) {
                  throw new GraphQLError("Price must be a valid positive number", {
                      extensions: { code: "BAD_REQUEST" },
                  });
              }
              packageToUpdate.price = price;
          }
  
          const updatedPackage = await packageToUpdate.save();
  
          return updatedPackage;
      } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
              throw new GraphQLError("Invalid or expired token", {
                  extensions: { code: "UNAUTHORIZED" },
              });
          }
          console.error(error);
          throw new GraphQLError("Failed to update package", {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
      }
    },

    deletePackage : async (_, {id}, req) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }
        if (user.role !== AuthRoles.ADMIN) {
          throw new GraphQLError("Forbidden: Only admins can delete packages", {
            extensions: {
              code: "FORBIDDEN",
            },
          });
        }

        const packageToDelete = await Package.findById(id);
        if (!packageToDelete) {
          throw new GraphQLError(`Package with id ${id} does not exist`, {
            extensions: { code: "NOT_FOUND" },
          });
        }

        await Package.findByIdAndDelete(id);

        return true;
        
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw new GraphQLError("Invalid or expired token", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }
        console.error(error);
        throw new GraphQLError("Failed to delete package", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
},

Query: {
  packages: async (_, { filterByDate }, req) => {
    
    try {
  
      if (filterByDate) {
        const parsedDate = moment(filterByDate, "YYYY-MM-DD", true).startOf('day').toDate();
        console.log('Parsed date:', parsedDate);
        console.log('Is date valid:', !isNaN(parsedDate));
      }
  
      const query = {};
      if (filterByDate) {
        const parsedDate = moment(filterByDate, "YYYY-MM-DD", true).startOf('day').toDate();
        
        if (!parsedDate || isNaN(parsedDate)) {
          console.log('Invalid date format');
          return []; 
        }
  
        query.expirationDate = { $gte: parsedDate };
      }
  
      console.log('Final query:', query);
  
      const packages = await Package.find(query).populate('createdBy');
      
      console.log('Packages found:', packages);
      console.log('Packages count:', packages.length);
  
      return packages || [];
  
    } catch (error) {
      console.error('Error in packages query:', error);
      
      return [];
    }
  },

  package: async (_, { id }) => {
    try {
      console.log('Request received for packageById query');
  
      if (!id) {
        throw new GraphQLError("Package ID is required", {
          extensions: { code: "BAD_REQUEST" },
        });
      }
  
      console.log('Fetching package with ID:', id);
      const packageData = await Package.findById(id);
      console.log('Fetched package:', packageData);
  
      if (!packageData) {
        console.log('Package not found');
        throw new GraphQLError("Package not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
  
      return packageData;
    } catch (error) {
      console.error('Error during packageById query execution:', error);
  
      throw new GraphQLError("Failed to fetch package", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  },

  Package: {
    expirationDate: (package) => package.expirationDate.toISOString(),
    createdAt: (package) => package.createdAt.toISOString(),
    updatedAt: (package) => package.updatedAt.toISOString(),
  },
};

module.exports = resolvers;
