FROM node:16.17.1-alpine3.15
WORKDIR /server
COPY . .
RUN npm install
CMD ["npm","run","start"]