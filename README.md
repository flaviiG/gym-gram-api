# Gym Gram API

Gym Gram API is the backend service for the Gym Gram mobile social media application, dedicated to the fitness domain. It provides RESTful endpoints to facilitate interaction and collaboration between fitness enthusiasts and professionals.

## Technologies Used

- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js:** A web application framework for Node.js, designed for building web applications and APIs.
- **MongoDB:** A document-oriented NoSQL database used for high volume data storage.
- **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.

## Installation

To get a local copy up and running, follow these simple steps.

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/gym-gram-api.git
   cd gym-gram-api
   ```

2. Install NPM packages:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB URI and other environment variables:

   ```env
   DATABASE_LOCAL=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```sh
   npm start
   ```
