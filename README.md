## Project setup

```bash
$ pnpm install
```

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
## For BD

```sh
pnpm i prisma -D
pnpx prisma init
```
## Decoradores

```sh
pnpm i class-validator class-transformer
```

Crear un archivo **.env**

```env
DATABASE_URL="postgresql://fuis18:mypass@192.168.0.12:5432/project?schema=public"
POSTGRES_USER=fuis18
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
/profile

```sh
nest g resource profile --no-spec
✔ What transport layer do you use? REST API
✔ Would you like to generate CRUD entry points? Yes
```

Creando los demás módulos
/resume

```sh
nest g res resume --no-spec
✔ What transport layer do you use? REST API
✔ Would you like to generate CRUD entry points? Yes
```

```sh
nest g res activity --no-spec
nest g res softskill --no-spec
nest g res education --no-spec
nest g res experience --no-spec
nest g res language --no-spec
nest g res skill --no-spec
nest g res project --no-spec
nest g res blog --no-spec
nest g res message --no-spec
```

Detectar archivos

```sh
npm i -D @types/multer
npm i uuid
```
