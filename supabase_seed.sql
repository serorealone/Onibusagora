-- Inserir Linhas de Ônibus Fictícias
INSERT INTO bus_lines (line_number, name) VALUES
('8000-10', 'Terminal Lapa - Praça Ramos'),
('5110-10', 'Terminal São Mateus - Terminal Mercado'),
('8700-10', 'Terminal Campo Limpo - Praça da Sé'),
('2002-10', 'Terminal Pq. Dom Pedro II - Terminal Bandeira');

-- Inserir Pontos de Ônibus Fictícios (Próximos ao centro de SP)
INSERT INTO stops (name, latitude, longitude) VALUES
('Ponto Praça da República', -23.5435, -46.6433),
('Ponto Terminal Bandeira', -23.5488, -46.6402),
('Ponto Praça da Sé', -23.5505, -46.6333),
('Ponto Terminal Mercado', -23.5448, -46.6291),
('Ponto Avenida Paulista (MASP)', -23.5614, -46.6559);
