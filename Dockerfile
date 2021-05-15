FROM node:14.16.1

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile \
  $([ "$NODE_ENV" = 'production' ] || [ "$NODE_ENV" = 'staging' ] && printf %s '--production=true')

COPY . .
RUN yarn build-bloxy && yarn build

RUN chmod +x ./bin/wait-for-it.sh

EXPOSE 3000

CMD yarn start
