FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY lerna.json ./
COPY client/ ./client/

RUN yarn install
		yarn build --scope client
		yarn cache clean

EXPOSE 80

WORKDIR /usr/src/app/client
CMD ["node", "dist/index.js"]