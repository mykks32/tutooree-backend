FROM node:23-alpine3.20 AS builder

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 8000

CMD ["pnpm", "start"]