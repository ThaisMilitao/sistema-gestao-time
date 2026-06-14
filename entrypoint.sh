#!/bin/sh

DATABASE_URL="postgresql://postgres:postgres@db:5432/gestao-time?schema=public"

echo "Aguardando o banco de dados e sincronizando tabelas..."
npx prisma db push --schema=./prisma/schema.prisma --url="$DATABASE_URL"

echo "Populando o banco com os dados..."
DATABASE_URL="$DATABASE_URL" npx prisma db seed

exec node server.js