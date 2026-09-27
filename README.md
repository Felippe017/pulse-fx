# Pulse FX — Câmbio & Indicadores Macro

Aplicação full-stack para acompanhamento de **câmbio (BRL)** e **indicadores macroeconômicos** a partir de fontes públicas (BCB e FRED), com dados **persistidos em PostgreSQL**, **API própria Node.js/TypeScript** e cliente **web React/TypeScript**.

> ⚠️ **Disclaimer:** Informação educacional. Não constitui recomendação de investimento.

---

## Sumário

- [Início Rápido (Docker)](#início-rápido-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Séries Escolhidas](#séries-escolhidas)
- [Regras de Variação](#regras-de-variação)
- [Arquitetura](#arquitetura)
- [Decisões Técnicas](#decisões-técnicas)
- [Rodando o Frontend](#rodando-o-frontend)
- [Rodando Testes e Lint](#rodando-testes-e-lint)

---

## Início Rápido (Docker)

**Pré-requisitos:** Docker e Docker Compose instalados.

```bash
# 1. Clonar o repositório
git clone <url-do-repo> pulse-fx && cd pulse-fx

# 2. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env e preencher FRED_API_KEY (obter em https://fredaccount.stlouisfed.org/apikeys)

# 3. Subir tudo
docker compose up --build

# 4. Acessar
# Frontend: http://localhost:3000
# API:      http://localhost:3001/api/indicators
```

O ambiente sobe em menos de 2 minutos. Na primeira inicialização, a API:
1. Roda as migrations do PostgreSQL
2. Faz seed dos indicadores
3. Sincroniza dados de todas as fontes
4. Inicia o servidor na porta 3001

---

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuário do PostgreSQL | `pulsefx` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `pulsefx_secret` |
| `POSTGRES_DB` | Nome do banco | `pulsefx` |
| `DATABASE_URL` | Connection string completa | (gerada pelo compose) |
| `FRED_API_KEY` | **Obrigatória.** Chave da API FRED | — |
| `API_PORT` | Porta da API | `3001` |
| `SYNC_TTL_MINUTES` | TTL de cache (min) entre syncs | `60` |
| `ADMIN_KEY` | Chave para trigger manual de sync | `pulse-fx-admin-key` |

---

## Séries Escolhidas

### Fonte: BCB (Banco Central do Brasil)

| Indicador | Código | Freq. | Justificativa |
|-----------|--------|-------|---------------|
| **Dólar PTAX (Venda)** | Olinda PTAX — `CotacaoDolarPeriodo` | Diária | Taxa oficial de câmbio USD/BRL usada em contratos, importações e exportações. Referência principal para FX no Brasil. |
| **Euro PTAX (Venda)** | Olinda PTAX — `CotacaoMoedaPeriodo` (EUR) | Diária | Segunda moeda mais relevante para comércio exterior e investimentos internacionais. |
| **Taxa Selic** | SGS série `432` | Diária | Taxa básica de juros do Brasil. Impacta custo de oportunidade em câmbio e atratividade do Real. |
| **IPCA (acum. 12m)** | SGS série `13522` | Mensal | Inflação oficial acumulada. Pressão inflacionária desvaloriza o Real. |

**Referências BCB:**
- PTAX Swagger: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/
- SGS: https://www3.bcb.gov.br/sgspub/
- Dados Abertos: https://dadosabertos.bcb.gov.br/

### Fonte: FRED (Federal Reserve Economic Data)

| Indicador | Series ID | Freq. | Justificativa |
|-----------|-----------|-------|---------------|
| **Fed Funds Rate** | `FEDFUNDS` | Mensal | Taxa de juros dos EUA. Diferencial BR-US é o principal driver do fluxo cambial. |
| **US CPI** | `CPIAUCSL` | Mensal | Inflação americana. Impacta expectativas de política monetária do Fed e valor do dólar. |

**Referências FRED:**
- Portal: https://fred.stlouisfed.org/
- API Docs: https://fred.stlouisfed.org/docs/api/fred/
- API Key: https://fredaccount.stlouisfed.org/apikeys

---

## Regras de Variação

### Definição

- **Último valor:** observação mais recente válida já persistida no banco.
- **Data de referência:** data da observação exibida (não confundir com hora da consulta).
- **Variação %:** `((valor_atual - valor_anterior) / |valor_anterior|) × 100`

### Denominador por tipo de série

| Tipo | Denominador (N) | Justificativa |
|------|-----------------|---------------|
| **Diária (FX, Selic)** | 1 dia útil anterior com dado | Variação dia-a-dia é o padrão de mercado para câmbio |
| **Mensal (IPCA, Fed Funds, CPI)** | 1 mês anterior com dado | Comparação mês-a-mês é a mais intuitiva para indicadores macro |

### Janela de histórico

| Tipo | Janela padrão | Períodos no detalhe |
|------|--------------|---------------------|
| **Diária** | 90 dias | 30D, 60D, 90D |
| **Mensal** | 24 meses | 6M, 12M, 24M |

### Tratamento de lacunas

- **Fins de semana e feriados:** usa o **último dado conhecido** (carry forward).
- **Sem interpolação** — em dados financeiros, interpolação pode gerar valores enganosos.
- **Feriados:** não são tratados de forma especial; a ausência de dado simplesmente usa o anterior.

---

## Arquitetura

```
pulse-fx/                         # Monorepo
├── docker-compose.yml            # PostgreSQL + API + Web
├── packages/shared/              # Tipos TypeScript compartilhados
├── apps/
│   ├── api/                      # Backend Node.js + Express + TypeScript
│   │   └── src/
│   │       ├── config/           # Validação de env com Zod
│   │       ├── database/         # Pool pg + migrations SQL
│   │       ├── domain/           # Lógica pura (variação, datas)
│   │       ├── repositories/     # Acesso a dados (indicadores, observações, favoritos)
│   │       ├── services/         # Integração BCB PTAX, BCB SGS, FRED, sync
│   │       ├── routes/           # Handlers HTTP
│   │       └── middleware/       # Error handler
│   └── web/                      # Frontend React + Vite + TypeScript
│       └── src/
│           ├── api/              # Client HTTP tipado
│           ├── hooks/            # Custom hooks (useIndicators, useIndicatorDetail)
│           ├── components/       # Dashboard, Cards, Detalhe, Chart, Disclaimer
│           └── styles/           # Design system CSS (dark theme + glassmorphism)
```

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/indicators` | Lista indicadores com último valor + variação % |
| `GET` | `/api/indicators/:id` | Detalhe com série temporal (params: `days`, `months`) |
| `POST` | `/api/favorites/:id` | Toggle favorito |
| `GET` | `/api/favorites` | Lista IDs favoritados |
| `POST` | `/api/sync` | Sync manual (requer header `X-Admin-Key`) |
| `GET` | `/api/health` | Health check |

### Banco de Dados (PostgreSQL)

4 migrations versionadas:
1. `indicators` — Metadados dos indicadores (com seed)
2. `observations` — Valores temporais com índice `(indicator_id, date)`
3. `favorites` — Indicadores favoritados
4. `sync_log` — Log de sincronização com TTL

---

## Decisões Técnicas

### Monorepo com npm workspaces
Escolhido por simplicidade — sem necessidade de ferramentas como Turborepo/Nx para um projeto deste porte. Os 3 pacotes (shared, api, web) compartilham tipos via workspace links.

### Express (não Fastify/Nest)
Framework maduro, com ecossistema robusto de middleware. Para um MVP, Express oferece o melhor balanço entre produtividade e familiaridade.

### Migrations SQL puras (não ORM)
Controle total sobre as queries. ORMs abstraem demais para um projeto onde performance de queries SQL (como `LATERAL JOIN`) é importante. Migrations são simples arquivos `.sql` versionados.

### Política de sincronização com TTL
- **TTL de 60 minutos** por indicador — evita chamadas redundantes às APIs externas.
- **Sync no boot** da API — garante dados atualizados ao subir o serviço.
- **Endpoint admin** — permite trigger manual protegido por header `X-Admin-Key`.
- **Upsert** — `ON CONFLICT DO UPDATE` evita duplicatas.

### Favoritos sem autenticação
Como o enunciado não exige sistema de usuários, favoritos são persistidos em tabela simples no banco (1 flag por indicador). Para multi-usuário, bastaria adicionar `user_id` à tabela. A estratégia é documentada e intencional.

### Design system CSS puro (sem Tailwind)
Decisão deliberada por controle total sobre o design. Custom properties CSS permitem tematização eficiente. O design usa glassmorphism, gradientes animados e micro-animações para um visual premium.

### Recharts para gráficos
Biblioteca React-first com boa integração e customização. AreaChart com gradiente e tooltips customizados no tema dark.

### Trade-offs

- **Sem WebSocket/SSE:** polling manual é suficiente para um MVP com dados que atualizam no máximo 1x/hora.
- **Sem Redis:** para o volume de dados deste MVP, PostgreSQL como cache é suficiente.
- **Sem autenticação:** fora do escopo; favoritos são globais.
- **Sem i18n:** interface em português fixo, adequada ao contexto BR.

---

## Rodando o Frontend (dev local)

```bash
# Na raiz do monorepo
npm install
npm run dev:web
# Acesse http://localhost:3000
```

O Vite dev server faz proxy automático de `/api/*` para `http://localhost:3001`.

---

## Rodando Testes e Lint

```bash
# Todos os testes
npm test

# Só backend
npm run test:api

# Só frontend
npm run test:web

# Lint
npm run lint
```

### Arquivos de teste (6 arquivos)

| Arquivo | Tipo | Escopo |
|---------|------|--------|
| `variation.test.ts` | Domínio | Cálculo de variação % |
| `date-utils.test.ts` | Domínio | Dias úteis, formatação de datas |
| `indicators.routes.test.ts` | HTTP | Rotas GET /api/indicators |
| `sync.routes.test.ts` | HTTP | Rota POST /api/sync (auth) |
| `IndicatorCard.test.tsx` | Frontend | Componente card (renderização, clicks) |
| `Disclaimer.test.tsx` | Frontend | Componente disclaimer |

---

## Briefing Original

O enunciado completo do desafio está em [`BRIEFING.md`](./BRIEFING.md).
