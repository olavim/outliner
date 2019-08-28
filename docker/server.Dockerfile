FROM node:10 as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY lerna.json ./
COPY server/ ./server/

RUN yarn install
RUN yarn build --scope server

EXPOSE 80

WORKDIR /usr/src/app/server
CMD ["node", "dist/index.js"]