FROM node:10-alpine

ARG service

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY lerna.json ./
COPY ${service}/ ./${service}

RUN yarn install
RUN yarn build --scope ${service}
RUN yarn cache clean

EXPOSE 80

WORKDIR /usr/src/app/${service}
CMD ["node", "dist/index.js"]