#!/bin/sh

echo "Aguardando o banco de dados e sincronizando tabelas..."

npx prisma db push --schema=./prisma/schema.prisma --url="postgresql://postgres:postgres@db:5432/gestao-time?schema=public"

exec node server.js