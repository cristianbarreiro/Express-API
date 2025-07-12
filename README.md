# Express + GraphQL API con MySQL

API sencilla construida con Express y GraphQL, conectada a una base de datos MySQL (XAMPP). Utiliza Apollo Server Express para GraphQL y nodemon para desarrollo.

---

## 🚀 Características

- API REST básica con Express (`/persons`)
- API GraphQL en `/graphql`
- Conexión a base de datos MySQL para persistencia
- Uso de UUID para identificadores únicos
- Scripts para desarrollo con nodemon

---

## 📋 Requisitos

- Node.js v14 o superior
- MySQL (por ejemplo XAMPP con MySQL activado)
- npm (gestor de paquetes)

---

## 🔧 Instalación

1. Clona el repositorio o crea tu proyecto:

```bash
git clone <tu-repo-url>
cd tu-proyecto
```

2. Instala dependencias:

```bash
npm install
```

3. Crea la base de datos MySQL y tabla:

```sql
CREATE DATABASE testdb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE testdb;
CREATE TABLE persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  age INT NOT NULL
);
```

4. Configura la conexión en `db.js`:

```js
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Cambia si tenés contraseña
  database: "testdb", // Cambia al nombre de tu DB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## ⚙️ Scripts disponibles

```bash
npm start    # Inicia el servidor normal
npm run dev  # Inicia el servidor con nodemon para desarrollo
```

---

## 📡 Endpoints disponibles

### REST

- `GET /persons` - Listar todas las personas
- `GET /persons/:id` - Obtener persona por ID
- `POST /persons` - Agregar persona
- `PUT /persons/:id` - Editar persona por ID
- `DELETE /persons/:id` - Eliminar persona por ID

### GraphQL

- Endpoint: `/graphql`
- Consultas y mutaciones definidas en el esquema (ver código)

---

## 📖 Ejemplos GraphQL

### Consulta para obtener todas las personas

```graphql
query {
  allPersons {
    id
    name
    age
  }
}
```

### Mutación para agregar persona

```graphql
mutation {
  addPerson(
    name: "Carlos Pérez"
    age: 28
    phone: "099-123-456"
    street: "Av. Libertador 123"
    city: "Montevideo"
  ) {
    id
    name
    age
    canDrink
    address {
      street
      city
    }
  }
}
```

---

## 🛠️ Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Apollo Server Express](https://www.apollographql.com/docs/apollo-server/integrations/middleware/)
- [MySQL](https://www.mysql.com/)
- [nodemon](https://nodemon.io/)

---

## 🤝 Contribuciones

¡Contribuciones bienvenidas! Hacé un fork, creá un branch, y abrí un pull request.

---

## 📄 Licencia

MIT

---

## 💬 Contacto

Tu nombre o email aquí
