FROM node:14.16.1

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=[ "$STAGE" = 'production' ] || [ "$STAGE" = 'staging' ]

COPY . .
RUN yarn build-bloxy && yarn build
RUN if [ "$STAGE" = 'production' ] && [ "$STAGE" = 'staging' ]; then rm -rf src fi

RUN chmod +x ./bin/wait-for-it.sh

EXPOSE 3000

CMD yarn start
