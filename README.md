# Hidden in Plain Sight

Hidden in Plain Sight is a Jamstack website and a fun little game(inspired by the popular game Where's Waldo/Wally) where the aim of the game is to find the given characters in the shortest amount of time. It's consisting of 2 parts:

- RESTful API back-end(this repository)
- [Front-end](https://github.com/T0nci/odin-waldo-frontend)

## What I've learnt

In this project I solidified previous knowledge and learnt and implemented some new things:

- cross site cookies
- back-end tests with SuperTest

## Features

API features:

- get all maps and their info
- start a game
- guess a character
- get a game's info
- update a game's name
- get the leaderboard for all maps

Front-end features:

- select a map and start a game
- play a game
- see their score(time) and optionally leave their name
- see the leaderboard for each map

## Live Preview

[Live Preview link](https://odin-waldo-frontend.vercel.app)

## Installation

### Prerequisites

- installed [NodeJS](https://nodejs.org/en)
- installed [PostgreSQL](https://www.postgresql.org/download/)
- created empty PostgreSQL database

### Setup and running locally

1. Clone the repo:
   ```bash
   git clone git@github.com:T0nci/odin-waldo-api.git
   ```
   The above example is cloning through SSH, this can be done through HTTPS as well:
   ```bash
   git clone https://github.com/T0nci/odin-waldo-api.git
   ```
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Create `.env` file and set the following environment variables with values that follow the instructions:
   ```dotenv
   PORT='SELECT A PORT'
   NODE_ENV='development'
   DATABASE_URL='YOUR POSTGRESQL DATABASE URL'
   JWT_SECRET='SET A SECRET THAT IS RANDOM AND AT LEAST 32 CHARACTERS LONG'
   FRONT_END='THE FRONT END URL'
   ```
4. Populate your database with tables from the Prisma schema:
   ```bash
   npx prisma migrate deploy
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

The server should be up and running. You can interact with the server through [Postman](https://www.postman.com/) or by setting up the [front-end server](https://github.com/T0nci/odin-waldo-frontend?tab=readme-ov-file#installation).

## License

[MIT](LICENSE.txt)

[(back to top)](#hidden-in-plain-sight)
