const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

let persons = [
  { id: "1", name: "Alice", age: 25 },
  { id: "2", name: "Bob", age: 30 },
];

// --- REST Endpoint ---
app.get("/persons", (req, res) => {
  res.json(persons);
});

// --- GraphQL TypeDefs ---
const typeDefs = gql`
  type Person {
    id: ID!
    name: String!
    age: Int!
  }

  type Query {
    allPersons: [Person!]!
    findPerson(id: ID!): Person
  }

  type Mutation {
    addPerson(name: String!, age: Int!): Person
    deletePerson(id: ID!): Person
  }
`;

const pool = require("./db");

const resolvers = {
  Query: {
    allPersons: async () => {
      const [rows] = await pool.query("SELECT * FROM persons");
      return rows;
    },
  },
  Mutation: {
    addPerson: async (_, { name, age }) => {
      const [result] = await pool.query(
        "INSERT INTO persons (name, age) VALUES (?, ?)",
        [name, age]
      );
      const insertedId = result.insertId;
      const [rows] = await pool.query("SELECT * FROM persons WHERE id = ?", [
        insertedId,
      ]);
      return rows[0];
    },
    // ... otras mutaciones igual
  },
};

// --- Crear e iniciar Apollo Server ---
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  server.applyMiddleware({ app }); // monta GraphQL en /graphql

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
    console.log(
      `🔧 GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();
