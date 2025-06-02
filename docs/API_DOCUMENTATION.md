# Documentação Técnica da API - Nosso Agro

## Visão Geral

A **Nosso Agro API** é um sistema de gerenciamento de produtores rurais desenvolvido em NestJS que oferece funcionalidades completas para cadastro, validação e auditoria de operações agrícolas.

## Especificação OpenAPI

A especificação completa da API está disponível em:
- **Swagger UI**: http://localhost:3000/api
- **JSON Spec**: http://localhost:3000/api-json
- **Arquivo local**: `docs/openapi.json`

## Endpoints Principais

### 🔐 Autenticação

#### POST `/auth/register`
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/login`
Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com", 
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 👨‍🌾 Produtores

Todos os endpoints de produtores requerem autenticação JWT via header `Authorization: Bearer <token>`.

#### POST `/produtores`
Cria um novo produtor rural.

**Validações Implementadas:**
- Exatamente um documento (CPF ou CNPJ, não ambos)
- CPF/CNPJ válidos com verificação de dígitos
- Soma das áreas agrícola e vegetação não pode exceder área total
- Unicidade de CPF/CNPJ no banco de dados

**Request Body:**
```json
{
  "cpf": "123.456.789-01",
  "nome_produtor": "João Silva",
  "nome_fazenda": "Fazenda São João",
  "cidade": "Ribeirão Preto",
  "estado": "SP",
  "area_total_hectares": 1000,
  "area_agricultavel_hectares": 800,
  "area_vegetacao_hectares": 200
}
```

**Response:**
```json
{
  "id": "uuid-do-produtor",
  "cpf": "123.456.789-01",
  "cnpj": null,
  "nome_produtor": "João Silva",
  "nome_fazenda": "Fazenda São João",
  "cidade": "Ribeirão Preto",
  "estado": "SP",
  "area_total_hectares": 1000,
  "area_agricultavel_hectares": 800,
  "area_vegetacao_hectares": 200
}
```

#### GET `/produtores`
Lista todos os produtores cadastrados.

**Response:**
```json
[
  {
    "id": "uuid-do-produtor",
    "cpf": "123.456.789-01",
    "cnpj": null,
    "nome_produtor": "João Silva",
    // ... outros campos
  }
]
```

#### GET `/produtores/{id}`
Busca um produtor específico por ID.

#### PUT `/produtores/{id}`
Atualiza dados de um produtor existente.

#### DELETE `/produtores/{id}`
Remove um produtor do sistema.

### 🏞️ Propriedades

#### POST `/propriedades`
Cria uma nova propriedade rural.

#### GET `/propriedades`
Lista todas as propriedades.

#### GET `/propriedades/{id}`
Busca propriedade por ID.

#### PUT `/propriedades/{id}`
Atualiza propriedade.

#### DELETE `/propriedades/{id}`
Remove propriedade.

### 🌾 Safras

#### POST `/safras`
Cria uma nova safra.

#### GET `/safras`
Lista todas as safras.

#### GET `/safras/{id}`
Busca safra por ID.

#### PUT `/safras/{id}`
Atualiza safra.

#### DELETE `/safras/{id}`
Remove safra.

## Códigos de Status HTTP

### Sucesso
- `200 OK` - Operação realizada com sucesso
- `201 Created` - Recurso criado com sucesso

### Erro do Cliente
- `400 Bad Request` - Dados de entrada inválidos
- `401 Unauthorized` - Token JWT ausente ou inválido
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: CPF/CNPJ já existente)

### Erro do Servidor
- `500 Internal Server Error` - Erro interno do servidor

## Exemplos de Erro

### Erro de Validação (400)
```json
{
  "message": [
    "CPF inválido",
    "CPF deve estar no formato: 000.000.000-00"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Erro de Conflito (409)
```json
{
  "message": "CPF já cadastrado no sistema",
  "error": "Conflict", 
  "statusCode": 409
}
```

### Erro de Autenticação (401)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## Headers Necessários

### Autenticação
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Content-Type
```
Content-Type: application/json
```

## Ambiente de Desenvolvimento

### URLs
- **API Base**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **OpenAPI JSON**: `http://localhost:3000/api-json`

### Banco de Dados
- **Host**: `localhost:5432`
- **Database**: `nosso_agro`
- **User**: `postgres`

## Logging e Auditoria

A API implementa um sistema completo de logging que registra:

### Tipos de Eventos Auditados
1. **Authentication Events**: Login, registro, falhas de autenticação
2. **CRUD Operations**: Criação, leitura, atualização, exclusão
3. **Validation Events**: Validações de CPF/CNPJ e regras de negócio
4. **Performance Metrics**: Tempo de resposta das operações
5. **Business Errors**: Erros de validação e constraints
6. **HTTP Requests**: Todas as requisições com request ID único

### Estrutura dos Logs
```json
{
  "timestamp": "2025-06-02T21:01:26.659Z",
  "level": "info",
  "message": "CRUD Operation",
  "category": "CRUD",
  "action": "CREATE",
  "resource": "PRODUTOR",
  "resourceId": "uuid-do-recurso",
  "userId": "uuid-do-usuario",
  "ip": "::ffff:172.19.0.1",
  "details": {
    "cpf": "[REDACTED]",
    "nome_produtor": "João Silva"
  }
}
```

### Localização dos Logs
- **Console**: Desenvolvimento (formatado e colorido)
- **Arquivos**: Produção (`logs/application-YYYY-MM-DD.log`)
- **Erros**: `logs/error-YYYY-MM-DD.log`

## Segurança

### Autenticação JWT
- Tokens válidos por 24 horas
- Algoritmo HS256
- Secret configurável via ambiente

### Proteção de Dados
- CPF/CNPJ mascarados nos logs como `[REDACTED]`
- Senhas criptografadas com bcrypt
- Validação rigorosa de entrada

### Rate Limiting
- Implementado via Guards do NestJS
- Logging de tentativas suspeitas

## Performance

### Métricas Monitoradas
- Tempo de resposta das operações
- Alertas para operações > 5 segundos
- Throughput de requisições

### Otimizações
- Conexão pooling do TypeORM
- Índices no banco de dados
- Logs estruturados para análise

## Troubleshooting

### Problemas Comuns

#### "Unauthorized" (401)
- Verificar se o token JWT está sendo enviado
- Confirmar se o token não expirou
- Validar formato do header Authorization

#### "CPF já cadastrado" (409)
- CPF/CNPJ já existe no banco
- Verificar duplicatas antes de criar

#### "Área inválida" (400)
- Soma das áreas não pode exceder área total
- Verificar cálculos antes do envio

### Logs para Debug
```bash
# Ver logs em tempo real
docker compose logs -f app

# Filtrar por categoria
docker compose exec app grep '"category":"AUTH"' logs/application-*.log

# Monitorar performance
docker compose exec app grep '"category":"PERFORMANCE"' logs/application-*.log
```

## Contato e Suporte

- **Desenvolvedor**: Nilson Ribeiro
- **GitHub**: https://github.com/NilsonRCS/nosso-agro
- **LinkedIn**: https://www.linkedin.com/in/nilsonrcs/ 