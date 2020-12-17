FROM node:14.15.2

# Install dependencies
WORKDIR /opt/app
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD node ./bin/www
