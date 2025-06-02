# Nosso Agro API

API para gerenciamento de produtores rurais e suas safras, desenvolvida com NestJS.

## Funcionalidades

- ✅ Autenticação JWT
- ✅ Documentação Swagger
- ✅ CRUD de Produtores
- ✅ Validação de dados
- ✅ Banco de dados PostgreSQL
- ✅ Docker para desenvolvimento

## Arquitetura

O projeto segue uma arquitetura modular baseada nos princípios do NestJS:

### Padrões Utilizados
- **Modular**: Cada funcionalidade principal é um módulo independente
- **MVC (Model-View-Controller)**: Separação clara entre modelos (entities), controladores e serviços
- **Repository Pattern**: Abstração da camada de dados usando TypeORM
- **DTO Pattern**: Objetos de transferência de dados para validação e tipagem
- **Dependency Injection**: Injeção de dependências para melhor acoplamento
- **Guard Pattern**: Proteção de rotas usando JWT Guards

### Estrutura de Camadas
```
└── src/
    ├── auth/                    # Módulo de Autenticação
    │   ├── dto/                # Data Transfer Objects
    │   ├── guards/             # JWT Guards
    │   ├── strategies/         # Estratégias de autenticação
    │   ├── auth.controller.ts  # Controlador de autenticação
    │   ├── auth.service.ts     # Serviço de autenticação
    │   └── auth.module.ts      # Módulo de autenticação
    │
    ├── modules/
    │   └── produtores/         # Módulo de Produtores
    │       ├── dto/           # DTOs de produtores
    │       ├── entities/      # Entidades do TypeORM
    │       ├── produtores.controller.ts
    │       ├── produtores.service.ts
    │       └── produtores.module.ts
    │
    ├── config/                 # Configurações da aplicação
    │   └── database.config.ts  # Configuração do banco de dados
    │
    └── database/              # Migrations e seeds
        └── migrations/        # Migrations do TypeORM
```

### Fluxo de Dados
1. **Request** → Requisição HTTP recebida
2. **Guard** → Verifica autenticação (se necessário)
3. **Controller** → Recebe a requisição e valida DTOs
4. **Service** → Implementa a lógica de negócio
5. **Repository** → Interage com o banco de dados
6. **Response** → Retorna a resposta formatada

## Pré-requisitos

- Docker e Docker Compose
- Node.js 20.x
- npm ou yarn

## Configuração do Projeto

1. Clone o repositório:
```bash
git clone https://github.com/NilsonRCS/nosso-agro.git
cd nosso-agro
```

2. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```bash
# Aplicação
PORT=3000
NODE_ENV=development
JWT_SECRET=seu_segredo_jwt_aqui

# Banco de dados
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nosso_agro

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nosso_agro
```

## Executando o Projeto

1. Inicie os containers com Docker Compose:
```bash
docker compose up --build
```

2. A API estará disponível em:
- API: http://localhost:3000
- Documentação Swagger: http://localhost:3000/api

## Documentação da API

### Autenticação

1. Registro de Usuário:
```bash
POST /auth/register
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

2. Login:
```bash
POST /auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Endpoints Protegidos

Todos os endpoints abaixo requerem autenticação JWT. Adicione o header:
```
Authorization: Bearer seu_token_jwt
```

#### Produtores

- `GET /produtores` - Lista todos os produtores
- `GET /produtores/:id` - Busca produtor por ID
- `POST /produtores` - Cria novo produtor
- `PUT /produtores/:id` - Atualiza produtor
- `DELETE /produtores/:id` - Remove produtor

## Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
├── modules/
│   └── produtores/      # Módulo de produtores
├── config/              # Configurações
└── database/            # Migrations e configurações do banco
```

## Desenvolvimento

Para desenvolvimento, você pode usar os seguintes comandos:

```bash
# Modo de desenvolvimento
npm run start:dev

# Executar testes
npm run test

# Verificar cobertura de testes
npm run test:cov

# Executar linter
npm run lint
```

## Licença

Este projeto está sob a licença MIT.

## Contato

- Autor - [Nilson Ribeiro](https://github.com/NilsonRCS)
- LinkedIn - [Nilson Ribeiro](https://www.linkedin.com/in/nilsonrcs/)
