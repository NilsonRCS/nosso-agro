# Nosso Agro API

API para gerenciamento de produtores rurais e suas safras, desenvolvida com NestJS.

## 📚 Documentação

Para facilitar o entendimento do sistema, a documentação está organizada da seguinte forma:

### Documentação Interativa
- **Swagger UI**: http://localhost:3000/api - Interface interativa para testar a API
- **OpenAPI Specification**: http://localhost:3000/api-json - Especificação completa em JSON

### Documentação Técnica
- **[Documentação da API](docs/API_DOCUMENTATION.md)** - Guia completo com exemplos práticos
- **[Especificação OpenAPI](docs/openapi.json)** - Arquivo de especificação para ferramentas

### Guias de Uso
- **README.md** (este arquivo) - Visão geral, instalação e configuração
- **Swagger UI** - Testes interativos e exemplos de requisições

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

## 🚀 Início Rápido

### 1. Clonagem e Configuração

```bash
# Clone o repositório
git clone https://github.com/NilsonRCS/nosso-agro.git
cd nosso-agro

# Crie o arquivo .env com as configurações
cp .env.example .env  # ou configure manualmente
```

### 2. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Aplicação
PORT=3000
NODE_ENV=development
JWT_SECRET=seu_segredo_jwt_super_seguro_aqui

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

### 3. Execução

```bash
# Inicie os containers
sudo docker compose up --build

# A API estará disponível em:
# - API: http://localhost:3000
# - Swagger: http://localhost:3000/api
```

## 🔧 Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento local
npm run start:dev

# Testes
npm run test
npm run test:cov
npm run test:e2e

# Qualidade de código
npm run lint
npm run format

# Build
npm run build
npm run start:prod
```

### Monitoramento de Logs

```bash
# Logs em tempo real
docker compose logs -f app

# Logs por categoria
docker compose exec app grep '"category":"AUTH"' logs/application-*.log
docker compose exec app grep '"category":"CRUD"' logs/application-*.log
docker compose exec app grep '"category":"PERFORMANCE"' logs/application-*.log

# Análise de performance
docker compose exec app jq '.duration' logs/application-*.log | sort -n
```

## 📖 Exemplos de Uso

### Autenticação

```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456", "name": "Usuário"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456"}'
```

### Criação de Produtor

```bash
# Com CPF
curl -X POST http://localhost:3000/produtores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "cpf": "123.456.789-01",
    "nome_produtor": "João Silva",
    "nome_fazenda": "Fazenda São João",
    "cidade": "Ribeirão Preto",
    "estado": "SP",
    "area_total_hectares": 1000,
    "area_agricultavel_hectares": 800,
    "area_vegetacao_hectares": 200
  }'

# Com CNPJ
curl -X POST http://localhost:3000/produtores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "cnpj": "11.222.333/0001-81",
    "nome_produtor": "Empresa Rural LTDA",
    "nome_fazenda": "Fazenda Corporativa",
    "cidade": "São Paulo",
    "estado": "SP",
    "area_total_hectares": 2000,
    "area_agricultavel_hectares": 1500,
    "area_vegetacao_hectares": 500
  }'
```

## 🏗️ Estrutura do Projeto

```
nosso-agro/
├── docs/                    # Documentação adicional
│   ├── API_DOCUMENTATION.md  # Guia completo da API
│   └── openapi.json          # Especificação OpenAPI
├── src/
│   ├── auth/                # Módulo de autenticação
│   ├── modules/             # Módulos de negócio
│   ├── config/              # Configurações
│   ├── services/            # Serviços globais
│   ├── interceptors/        # Interceptadores HTTP
│   ├── filters/             # Filtros de exceção
│   └── database/            # Migrations
├── logs/                    # Logs da aplicação (gerados)
├── docker-compose.yml       # Configuração Docker
├── Dockerfile              # Container da aplicação
└── README.md               # Este arquivo
```

## 🔒 Segurança

- **Autenticação JWT** com tokens de 24h
- **Criptografia bcrypt** para senhas
- **Validação rigorosa** de entrada
- **Mascaramento de dados** sensíveis nos logs
- **Auditoria completa** de operações

## 📊 Monitoramento

O sistema inclui logging completo com:

- **Auditoria de operações** (CRUD, autenticação)
- **Métricas de performance** (tempo de resposta)
- **Logs estruturados** em JSON
- **Rotação automática** de arquivos
- **Alertas de operações lentas**

## 🐛 Solução de Problemas

### Problemas Comuns

**"Unauthorized" (401)**
- Verificar token JWT no header Authorization
- Confirmar se token não expirou (24h)

**"CPF já cadastrado" (409)**
- CPF/CNPJ já existe no banco
- Usar endpoint PUT para atualizar

**"Área inválida" (400)**
- Soma agricultável + vegetação ≤ área total
- Verificar cálculos matemáticos

### Debug

```bash
# Ver todos os logs
docker compose logs app

# Logs de erro específicos
docker compose exec app cat logs/error-*.log

# Performance issues
docker compose exec app grep '"duration"' logs/application-*.log | grep -v '"[0-9]ms"'
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Contato

- **Desenvolvedor**: [Nilson Ribeiro](https://github.com/NilsonRCS)
- **LinkedIn**: [Nilson Ribeiro](https://www.linkedin.com/in/nilsonrcs/)
- **Repositório**: https://github.com/NilsonRCS/nosso-agro

---

📚 **Para mais detalhes**, consulte a [Documentação Técnica Completa](docs/API_DOCUMENTATION.md) ou acesse o [Swagger UI](http://localhost:3000/api) quando a aplicação estiver rodando.