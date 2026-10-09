FROM node:26.11.1@sha256:32fa97f3363975684b08bf4e8a68a47c7905175cc20275b50b974bbd02aba731

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
