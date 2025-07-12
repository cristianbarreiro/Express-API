const express = require("express");
const { ApolloServer, gql, UserInputError } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const app = express();
app.use(express.json());

// --- REST Endpoint (ejemplo) ---
app.get("/persons", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM persons");
  res.json(rows);
});

// --- GraphQL Schema ---
const typeDefs = gql`
  type Address {
    street: String!
    city: String!
  }

  type Person {
    id: ID!
    name: String!
    age: Int!
    phone: String!
    street: String!
    city: String!
    address: Address!
    canDrink: Boolean!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String!
      street: String!
      city: String!
      age: Int!
    ): Person
    editPerson(
      id: ID!
      name: String
      phone: String
      street: String
      city: String
      age: Int
    ): Person
    deletePerson(id: ID!): Person
    deleteAllPersons: [Person!]!
  }
`;

const resolvers = {
  Query: {
    personCount: async () => {
      const [rows] = await pool.query("SELECT COUNT(*) as count FROM persons");
      return rows[0].count;
    },
    allPersons: async () => {
      const [rows] = await pool.query("SELECT * FROM persons");
      return rows;
    },
    findPerson: async (_, { name }) => {
      const [rows] = await pool.query("SELECT * FROM persons WHERE name = ?", [
        name,
      ]);
      return rows[0] || null;
    },
  },
  Mutation: {
    addPerson: async (_, args) => {
      const [existing] = await pool.query(
        "SELECT * FROM persons WHERE name = ?",
        [args.name]
      );
      if (existing.length > 0) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      const [result] = await pool.query(
        "INSERT INTO persons (name, age, phone, street, city) VALUES (?, ?, ?, ?, ?)",
        [args.name, args.age, args.phone, args.street, args.city]
      );
      const [rows] = await pool.query("SELECT * FROM persons WHERE id = ?", [
        result.insertId,
      ]);
      return rows[0];
    },
    editPerson: async (_, args) => {
      const [rows] = await pool.query("SELECT * FROM persons WHERE id = ?", [
        args.id,
      ]);
      if (rows.length === 0) return null;

      const current = rows[0];
      const updated = {
        name: args.name || current.name,
        age: args.age !== undefined ? args.age : current.age,
        phone: args.phone || current.phone,
        street: args.street || current.street,
        city: args.city || current.city,
      };

      await pool.query(
        "UPDATE persons SET name = ?, age = ?, phone = ?, street = ?, city = ? WHERE id = ?",
        [
          updated.name,
          updated.age,
          updated.phone,
          updated.street,
          updated.city,
          args.id,
        ]
      );

      const [updatedRow] = await pool.query(
        "SELECT * FROM persons WHERE id = ?",
        [args.id]
      );
      return updatedRow[0];
    },
    deletePerson: async (_, { id }) => {
      const [rows] = await pool.query("SELECT * FROM persons WHERE id = ?", [
        id,
      ]);
      if (rows.length === 0) return null;

      await pool.query("DELETE FROM persons WHERE id = ?", [id]);
      return rows[0];
    },
    deleteAllPersons: async () => {
      const [rows] = await pool.query("SELECT * FROM persons");
      await pool.query("DELETE FROM persons");
      return rows;
    },
  },
  Person: {
    address: (root) => ({
      street: root.street,
      city: root.city,
    }),
    canDrink: (root) => root.age >= 18,
  },
};

// --- Iniciar Apollo Server ---
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
    console.log(
      `🔧 GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();
