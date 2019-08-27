FROM node:10 as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY lerna.json ./
COPY client/ ./client/

RUN yarn install
RUN yarn build --scope client

EXPOSE 3000

WORKDIR /usr/src/app/client
CMD ["node", "dist/index.js"]