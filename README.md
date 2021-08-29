arora-api
================

[![Discord](https://discordapp.com/api/guilds/761634353859395595/embed.png)](https://discord.gg/tJFNC5Y)
[![Depfu](https://badges.depfu.com/badges/8d74b1db957c28ca20ea845f9181f3c4/count.svg)](https://depfu.com/github/guidojw/arora-api?project_id=10273)
[![Build status](https://badge.buildkite.com/63cd463b34afdd64116e2983ec91e8b2d1755b5d1b35373718.svg)](https://buildkite.com/guidos-projects/arora-api)

## Prerequisites
* [Node.js](https://nodejs.org/) (with NPM)
* [Yarn](https://yarnpkg.com/) (alternative to NPM, not required)
* A running [PostgreSQL](https://www.postgresql.org/download/) server

## Installation
1. Create a Postgres user with permission to create databases.
2. Create a new database as your just created Postgres user, named `arora_api_<env>` with `<env>` being your 
   `NODE_ENV` environment variable. The project tries to connect to database `arora_api_development` on `127.0.0.1` 
   (see `ormconfig.js`) if `NODE_ENV` is not set.<br/>
   To connect to a database on an external IP, use `staging` or `production` and set `POSTGRES_HOST` in `.env`
   containing the address of your external database server.
3. Install the dependencies with `yarn install` or `npm install`.
4. Copy `.env.example` to `.env` and update the fields to reflect your environment. `POSTGRES_HOST` and the last 
   variables starting at `SENTRY_DSN` are optional, so if you don't set these, prepend them with a #.
5. [Generate](https://travistidwell.com/jsencrypt/demo/) an RSA key pair and add them as files named `private.key` and 
   `public.key` respectively to the root of this project.
6. [Generate](https://jwt.io/) a JSON Web Token using the just generated RSA key pair. You can enter the public and 
   private keys underneath "VERIFY SIGNATURE". What you enter underneath "PAYLOAD" doesn't matter since that's not 
   being used in this project at the moment. Make sure to set the algorithm to `RS256`.<br/>
   Save this JWT somewhere as it's used for authenticating incoming requests.
7. Configure the configurations in `src/configs` as desired. For example:
   * comment out configurations of cron jobs you don't want the server to run.
   * change `1018818` in the `args` arrays to your own group's ID to have the jobs run for your group instead.

## Usage
* If you're starting the project for the first time, or if a new database migration has been added (in 
  `src/migrations`), you need to run `typeorm migration:run` before continuing to the next steps.
* To compile the TypeScript source to `.js` files, run `yarn build` or `npm run build`. 
* To start the server, run `yarn start` or `npm start`. 
* The project is now accessible [http://localhost:3000](http://localhost:3000).
