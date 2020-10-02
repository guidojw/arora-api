FROM node:14

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install Node.js dependencies
COPY package*.json ./

USER node

RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000

CMD npm start
