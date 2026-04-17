FROM node:22-alpine

WORKDIR /app

COPY package.json /app

RUN npm install
RUN npm audit fix

COPY . .

EXPOSE 8080

ENTRYPOINT [ "node", "index.js" ]