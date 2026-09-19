FROM node:26.9.0@sha256:fa271c47a5d81dc321f4a45be01362f5b3de7559edc7e76b8c4089be1e50d866

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

WORKDIR /opt/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

COPY . .
RUN yarn build:prod

RUN chmod +x ./bin/wait-for-it.sh

EXPOSE 3000

CMD yarn start
