CREATE TABLE indicators (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,         -- 'bcb-ptax' | 'bcb-sgs' | 'fred'
  external_id VARCHAR(100) NOT NULL,   -- Código da série na fonte
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  frequency VARCHAR(20) NOT NULL,      -- 'daily' | 'monthly'
  unit VARCHAR(50) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- Seed: indicadores pré-configurados
INSERT INTO indicators (source, external_id, name, description, frequency, unit) VALUES
  ('bcb-ptax', 'USD', 'Dólar PTAX (Venda)', 'Taxa de câmbio oficial USD/BRL de fechamento (PTAX), divulgada pelo Banco Central do Brasil. Referência para contratos, importações e exportações.', 'daily', 'BRL'),
  ('bcb-ptax', 'EUR', 'Euro PTAX (Venda)', 'Taxa de câmbio oficial EUR/BRL de fechamento (PTAX). Segunda moeda mais relevante para comércio exterior e investimentos internacionais.', 'daily', 'BRL'),
  ('bcb-sgs', '432', 'Taxa Selic', 'Taxa básica de juros do Brasil (meta Selic), definida pelo COPOM. Impacta o custo de oportunidade de posições em câmbio e a atratividade do Real.', 'daily', '% a.a.'),
  ('bcb-sgs', '13522', 'IPCA (acum. 12 meses)', 'Índice de preços ao consumidor amplo acumulado em 12 meses. Inflação oficial do Brasil — pressão inflacionária tende a desvalorizar o Real.', 'monthly', '%'),
  ('fred', 'FEDFUNDS', 'Fed Funds Rate', 'Taxa de juros básica dos EUA (Federal Funds Effective Rate). O diferencial de juros BR-US é o principal driver do fluxo cambial.', 'monthly', '%'),
  ('fred', 'CPIAUCSL', 'US CPI (índice)', 'Consumer Price Index para todos os consumidores urbanos dos EUA. Dados de CPI impactam expectativas de política monetária do Fed e o valor global do dólar.', 'monthly', 'índice');
