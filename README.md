## Project setup

No tengo tanta experiencia en el backend, como en el frontend
Pero ya me había formado un stack, que es este
Utilizo el patron de diseño MVC y fastify para la velocidad

|                 | URL                                                                                  |
| --------------- | ------------------------------------------------------------------------------------ |
| 🌐 Frontend      | [web-pos-frontend](http://web-pos-frontend-9h2hs3-b67272-144-225-147-25.traefik.me/) |
| ⚙️ Backend       | [web-pos-backend](http://web-pos-backend-vxrrd4-1172b8-144-225-147-25.traefik.me/)   |
| 📦 Repo Frontend | [github.com/fuis18/web-pos-back](https://github.com/fuis18/web-pos-front)            |

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
## Setup local

```sh
# Generate
nest new web-pos-back
cd ./web-pos-back

# Use fastify
pnpm i fastify @nestjs/platform-fastify
pnpm rm -D @types/express
pnpm rm @nestjs/platform-express

# install base
pnpm i
pnpm i class-validator class-transformer

# ORM for DB
pnpm i prisma -D
pnpx prisma init
pnpm prisma:generate
```


Crear un archivo **.env**

```env
DATABASE_URL="postgresql://user:mypass@192.168.0.12:5432/project?schema=public"
POSTGRES_USER=user
POSTGRES_PASSWORD=mypass
POSTGRES_DB=project
```

Crear un archivo **docker-compose.yml**<br>

```yml
services:
  db:
    image: postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    container_name: postgres_container
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
```

Modelos de prisma en **./prisma/schema.prisma**<br>

Encender la base de datos

```sh
sudo systemctl start docker

docker compose up
docker ps
```

Backup

```sh
docker exec -t postgres_container pg_dump -U ${fuis18} ${password} > backup.sql
```

Restaurar

```sh
docker exec -i postgres_container psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql

```

Migración de Prisma

```sh
pnpx prisma migrate dev --name init
```

Encender el backend

```sh
npm run start:dev
npm run start
```

Crear un recurso
/products

```sh
nest g resource products --no-spec
✔ What transport layer do you use? REST API
✔ Would you like to generate CRUD entry points? Yes
```

Detectar archivos

```sh
npm i -D @types/multer
npm i uuid
```
