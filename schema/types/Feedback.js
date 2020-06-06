const { gql } = require('apollo-server-express');

export const typeDefs = gql`
    type Feedback {
        _id: ID!
        Ratings: [Int]!
        Score: Float!
    }
`;

export const resolvers = {  
};