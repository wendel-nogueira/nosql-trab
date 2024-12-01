# nosql-trab

## Uso prisma

1 - Gerar o client com `npx prisma generate`

2 - Realizar o import do client e instância para fazer as consultas do banco
`    import { PrismaClient } from '@prisma/client'
    const prisma = new PrismaClient()`

3 - Depois já pode fazer as chamadas - [documentação do prisma com exemplo de CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
