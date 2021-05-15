FROM node:14.16.1

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build-bloxy && yarn build
RUN rm -rf src

RUN chmod +x ./bin/wait-for-it.sh

EXPOSE 3000

CMD yarn start
