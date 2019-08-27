FROM node:10 as builder

ENV project

WORKDIR /usr/src/app

COPY package.json ./
COPY lerna.json ./
COPY ${project}/ ./${project}/

RUN yarn install
RUN yarn build --scope ${project}

EXPOSE 80

WORKDIR /usr/src/app/${project}
CMD ["node", "dist/index.js"]