FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm init -y && npm install --save-dev

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
