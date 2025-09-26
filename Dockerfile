FROM node:24.9.0@sha256:a2ed436bacdcc9dd543202a327bbce2519c43e3755a41a186f8f51c037ef3342

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
