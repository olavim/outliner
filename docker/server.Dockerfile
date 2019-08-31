FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY lerna.json ./
COPY server/ ./server/

RUN yarn install
		yarn build --scope server
		yarn cache clean

EXPOSE 80

WORKDIR /usr/src/app/server
CMD ["node", "dist/index.js"]