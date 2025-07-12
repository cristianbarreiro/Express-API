const express = require("express");
const { ApolloServer, gql, UserInputError } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const cors = require("cors"); // 👈 importa cors
const app = express();

app.use(cors()); // 👈 habilita CORS
app.use(express.json());

// --- REST Endpoint (ejemplo) ---
app.get("/persons", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM persons");
  res.json(rows);
});

const typeDefs = gql`
  type Person {
    id: ID!
    name: String!
    mail: String!
    password: String!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
    login(mail: String!, password: String!): Person
  }

  type Mutation {
    addPerson(name: String!, mail: String!, password: String!): Person
    editPerson(id: ID!, name: String, mail: String, password: String): Person
    deletePerson(id: ID!): Person
    deleteAllPersons: [Person!]!
  }
`;

const resolvers = {
  Query: {
    login: async (_, { mail, password }) => {
      const [rows] = await pool.query(
        "SELECT * FROM persons WHERE mail = ? AND password = ?",
        [mail, password]
      );
      return rows[0] || null;
    },
    personCount: async () => {
      const [rows] = await pool.query("SELECT COUNT(*) AS count FROM persons");
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
        "SELECT * FROM persons WHERE mail = ?",
        [args.mail]
      );
      if (existing.length > 0) {
        throw new UserInputError("Email must be unique", {
          invalidArgs: args.mail,
        });
      }

      const [result] = await pool.query(
        "INSERT INTO persons (name, mail, password) VALUES (?, ?, ?)",
        [args.name, args.mail, args.password]
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
        mail: args.mail || current.mail,
        password: args.password || current.password,
      };

      await pool.query(
        "UPDATE persons SET name = ?, mail = ?, password = ? WHERE id = ?",
        [updated.name, updated.mail, updated.password, args.id]
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
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
