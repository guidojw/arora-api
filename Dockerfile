FROM node:24.10.0@sha256:377f1c17906eb5a145c34000247faa486bece16386b77eedd5a236335025c2ef

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
