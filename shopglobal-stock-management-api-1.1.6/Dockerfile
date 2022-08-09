# Common build stage
FROM node:14.14.0-alpine3.12

WORKDIR /app

ENV NODE_ENV production

ADD dist .

COPY package*.json ./

RUN npm install

RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "server.js", "-i", "0"]
