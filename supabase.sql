-- Supabase Schema for ÔnibusAgora
-- Cole o código abaixo no SQL Editor do Supabase para criar as tabelas e políticas de segurança.

-- 1. bus_lines (Linhas de ônibus)
CREATE TABLE bus_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_number VARCHAR(10) NOT NULL UNIQUE,
    route_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. stops (Pontos de parada)
CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. reports (Relatos dos ônibus pelos usuários)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    line_id UUID REFERENCES bus_lines(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES stops(id) ON DELETE CASCADE, -- Opcional, ponto mais próximo que o backend calcular
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Role Level Security (RLS) nas tabelas
ALTER TABLE bus_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso:
-- bus_lines e stops: Leitura pública, escrita restrita (apenas admin ou via service_role)
CREATE POLICY "Public read access for bus_lines" ON bus_lines FOR SELECT USING (true);
CREATE POLICY "Public read access for stops" ON stops FOR SELECT USING (true);

-- reports: Leitura pública, mas inserção apenas para usuários autenticados
CREATE POLICY "Public read access for reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Usuários podem ver, mas gerenciar apenas seus próprios reports
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = user_id);

-- Habilitar o Realtime para a tabela reports
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO bus_lines (line_number, route_name) VALUES
('123', 'Centro - Bairro Universitário'),
('456', 'Terminal Norte - Shopping'),
('789', 'Campus - Estação Central');

-- Exemplo de pontos de parada
INSERT INTO stops (name, address, latitude, longitude) VALUES
('Ponto Faculdade', 'Rua Universitária, 100', -23.5505, -46.6333),
('Ponto Metrô', 'Av. Paulista, 1000', -23.5615, -46.6560),
('Ponto Shopping', 'Av. das Nações, 500', -23.5850, -46.6800);
