FROM node:25.2.1@sha256:6d362f0df70431417ef79c30e47c0515ea9066d8be8011e859c6c3575514a027

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
