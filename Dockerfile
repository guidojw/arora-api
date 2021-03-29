FROM node:14.16.0

# Install dependencies
WORKDIR /opt/app
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

RUN chmod +x ./bin/wait-for-it.sh

EXPOSE 3000

CMD npm start
