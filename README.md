# Nosso Agro API

API para gerenciamento de produtores rurais e suas safras, desenvolvida com NestJS.

## Funcionalidades

- ✅ Autenticação JWT
- ✅ Documentação Swagger
- ✅ CRUD de Produtores
- ✅ Validação de dados (CPF/CNPJ)
- ✅ Banco de dados PostgreSQL
- ✅ Docker para desenvolvimento
- ✅ Sistema de Logging e Auditoria
- ✅ Interceptadores de HTTP
- ✅ Logs estruturados (JSON)

## Arquitetura

O projeto segue uma arquitetura modular baseada nos princípios do NestJS:

### Padrões Utilizados
- **Modular**: Cada funcionalidade principal é um módulo independente
- **MVC (Model-View-Controller)**: Separação clara entre modelos (entities), controladores e serviços
- **Repository Pattern**: Abstração da camada de dados usando TypeORM
- **DTO Pattern**: Objetos de transferência de dados para validação e tipagem
- **Dependency Injection**: Injeção de dependências para melhor acoplamento
- **Guard Pattern**: Proteção de rotas usando JWT Guards
- **Interceptor Pattern**: Logging automático de requisições HTTP
- **Observer Pattern**: Sistema de auditoria para operações críticas

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
    │   ├── typeorm.config.ts   # Configuração do banco de dados
    │   └── winston.config.ts   # Configuração do sistema de logs
    │
    ├── services/              # Serviços globais
    │   └── audit-logger.service.ts  # Serviço de auditoria
    │
    ├── interceptors/          # Interceptadores HTTP
    │   └── logging.interceptor.ts   # Log automático de requisições
    │
    ├── filters/               # Filtros de exceção
    │   └── all-exceptions.filter.ts # Captura e log de erros
    │
    └── database/              # Migrations e seeds
        └── migrations/        # Migrations do TypeORM
```

### Sistema de Logging e Auditoria

O sistema implementa um robusto sistema de logging com as seguintes características:

#### Funcionalidades do Sistema de Logging
- **Logs Estruturados**: Todos os logs são formatados em JSON para facilitar análise
- **Rotação Automática**: Logs são rotacionados diariamente com retenção configurável
- **Múltiplos Transportes**: Console (desenvolvimento) e arquivos (produção)
- **Auditoria Completa**: Rastreamento de operações CRUD, autenticação e validações
- **Performance Monitoring**: Métricas de tempo de resposta das operações
- **Segurança**: Dados sensíveis (CPF/CNPJ) são mascarados nos logs

#### Tipos de Logs Capturados

1. **Logs de Autenticação**:
   - Registro de usuários
   - Login/logout
   - Tentativas de acesso falhadas

2. **Logs de Operações CRUD**:
   - Criação, leitura, atualização e exclusão de registros
   - Dados de contexto (usuário, IP, timestamp)
   - IDs dos recursos manipulados

3. **Logs de Validação**:
   - Validações de CPF/CNPJ
   - Validações de regras de negócio (áreas das propriedades)
   - Resultados de validação (sucesso/falha)

4. **Logs de Performance**:
   - Tempo de execução de operações
   - Alertas para operações lentas (>5s)
   - Métricas de throughput

5. **Logs de Erro**:
   - Erros de negócio
   - Exceções do sistema
   - Stack traces para debugging

6. **Logs HTTP**:
   - Requisições de entrada (método, URL, IP, user-agent)
   - Respostas (status, tempo, tamanho)
   - Request IDs únicos para rastreamento

#### Estrutura dos Logs
```json
{
  "timestamp": "2025-06-02T21:01:26.659Z",
  "level": "info",
  "message": "CRUD Operation",
  "category": "CRUD",
  "context": "AuditLoggerService",
  "action": "CREATE",
  "resource": "PRODUTOR",
  "resourceId": "cbd5a4e0-34fe-4e44-b1b8-b94c2a171f14",
  "userId": "fba54ccc-a0b7-43d8-b1f0-cfebc15d1ab0",
  "ip": "::ffff:172.19.0.1",
  "details": {
    "cpf": "[REDACTED]",
    "nome_produtor": "Maria Santos"
  }
}
```

### Fluxo de Dados
1. **Request** → Requisição HTTP recebida
2. **Logging Interceptor** → Log da requisição de entrada
3. **Guard** → Verifica autenticação (com logs de auditoria)
4. **Controller** → Recebe a requisição e valida DTOs
5. **Service** → Implementa a lógica de negócio (com logs de operações)
6. **Repository** → Interage com o banco de dados
7. **Audit Logger** → Registra operações para auditoria
8. **Response** → Retorna a resposta formatada (com logs de saída)

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

# Configuração de Logs
LOG_LEVEL=info
ENABLE_FILE_LOGS=true
```

### Variáveis de Ambiente para Logging

- `LOG_LEVEL`: Nível de log (error, warn, info, debug, verbose)
- `ENABLE_FILE_LOGS`: Habilita salvamento de logs em arquivos (true/false)

## Executando o Projeto

1. Inicie os containers com Docker Compose:
```bash
docker compose up --build
```

2. A API estará disponível em:
- API: http://localhost:3000
- Documentação Swagger: http://localhost:3000/api

### Acessando os Logs

Os logs ficam disponíveis em:

1. **Console** (desenvolvimento):
```bash
docker compose logs -f app
```

2. **Arquivos** (produção):
```bash
# Logs da aplicação
docker compose exec app cat logs/application-YYYY-MM-DD.log

# Logs de erro
docker compose exec app cat logs/error-YYYY-MM-DD.log
```

3. **Logs em tempo real**:
```bash
# Seguir logs em tempo real
docker compose exec app tail -f logs/application-*.log
```

### Análise de Logs

Para análise avançada dos logs estruturados, você pode usar ferramentas como:

```bash
# Filtrar logs por categoria
docker compose exec app grep '"category":"AUTH"' logs/application-*.log

# Contar operações por usuário
docker compose exec app grep '"userId"' logs/application-*.log | jq '.userId' | sort | uniq -c

# Monitorar performance
docker compose exec app grep '"category":"PERFORMANCE"' logs/application-*.log | jq '.duration'
```

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
├── config/              # Configurações (DB, Logging)
├── services/            # Serviços globais (AuditLogger)
├── interceptors/        # Interceptadores HTTP
├── filters/             # Filtros de exceção
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
