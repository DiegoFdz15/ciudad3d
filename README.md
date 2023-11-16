# Ejecución del programa sin docker
node version >= 16.17.1
npm version >= 8.15
```bash
npm install
npm run start
```

# Ejecución del programa con docker
Docker version 19.03.15
```bash
docker build -t server .
docker run -d -p 3000:3000 server
```