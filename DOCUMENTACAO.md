# Documentação do Projeto: ÔnibusAgora 🚌

Esta documentação foi elaborada para apresentação acadêmica do projeto ÔnibusAgora, detalhando sua motivação, arquitetura técnica e funcionalidades implementadas.

---

## 1. O Problema e a Motivação
O transporte público urbano frequentemente sofre com a falta de previsibilidade. Aplicativos oficiais de rastreamento muitas vezes possuem lacunas de sinalização (GPS falho ou ausente nos veículos). 
A motivação do **ÔnibusAgora** é resolver esse problema através de *Crowdsourcing* (colaboração coletiva). Os próprios passageiros que já estão a bordo do ônibus compartilham a sua viagem em tempo real, alimentando um mapa colaborativo que calcula a previsão de chegada para os usuários que ainda estão nos pontos de ônibus.

---

## 2. Visão Geral do Sistema (Arquitetura)
O projeto foi desenvolvido garantindo separação de responsabilidades (Frontend e Backend) utilizando ferramentas modernas do mercado de desenvolvimento web.

**Stack Tecnológico Básico:**
* **Frontend:** React.js, Vite (bundler), Tailwind CSS (estilização), e React-Leaflet (mapas interativos).
* **Backend:** Node.js com Express.js (criação de API RESTful).
* **Banco de Dados:** Supabase (PostgreSQL), atuando tanto como armazenamento relacional quanto para provedor de backend-as-a-service.

A arquitetura funciona no modelo **Client-Server**:
1. O FrontEnd requisita dados ao BackEnd (pontos, linhas, ou previsão de chegada).
2. O Backend se comunica com o banco de dados (Supabase) via chaves seguras (Service Role).
3. O Backend processa o tempo estimado (ETA) e devolve a informação formatada em JSON ao Client.

---

## 3. Funcionalidades Desenvolvidas

### A. Mapa Interativo (Home)
- Utilização da biblioteca de mapas *OpenStreetMap* renderizados via *Leaflet*.
- **Como funciona:** O sistema busca automaticamente do Backend as coordenadas (Latitude/Longitude) dos pontos de ônibus cadastrados e os exibe. Ao clicar em um ponto, a aplicação consulta a previsão de chegada.

### B. Reporte de Viagens Colaborativo
- Formulário intuitivo acessado via botão de "Reportar Ônibus".
- **Como funciona:** O usuário seleciona a linha em que está. A aplicação utiliza a `Geolocation API` nativa do navegador para extrair as coordenadas (Lat/Lng) exatas do celular do passageiro.
- Essa localização é enviada ao Backend via solicitação HTTP POST (`/api/reports`).

### C. Algoritmo de Previsão de Chegada (ETA)
- O cálculo do tempo estimado não é "mágico", mas baseia-se em geometria esférica e velocidade média.
- **Como funciona:** O Backend recebe a requisição com o ID de um ponto de ônibus. Ele busca no Supabase onde estão os últimos usuários que reportaram estar a bordo das linhas daquele ponto. Usando a **Fórmula de Haversine** (cálculo de distância em linha reta entre dois pontos na Terra), o servidor cruza a distância restante com uma velocidade média configurada internamente (ex: 25 km/h), entregando uma projeção em minutos para o frontend.

---

## 4. Estrutura de Banco de Dados (Entidade-Relacionamento)
Foram construídas três entidades principais no Supabase relacional:

1. **`bus_lines`**: Representa as frotas e linhas. (Ex: 8000-10 - Terminal Lapa)
2. **`stops`**: Representa a geolocalização fixa dos abrigos/pontos de embarque.
3. **`reports`**: Uma tabela dependente que registra logs em tempo-real. Grava qual usuário reportou a posição, em qual linha de ônibus ele indicou estar, e quais suas coordenadas de GPS exatas naquele segundo.

---

## 5. Escalabilidade e Próximos Passos
O aplicativo foi estruturado visando escalabilidade em Produção:
- **Separação de Camadas:** Como API (express) e Tela (React) são separadas, é possível construir no futuro um aplicativo iOS/Android (react-native, por exemplo) reaproveitando o exato mesmo backend e banco de dados.
- **Integração Realtime (Opcional Futuro):** Pela infraestrutura do Supabase ser moderna, as requisições hoje funcionam baseadas em HTTP Polling. Uma evolução orgânica seria transformar a consulta em chamadas *Websocket* nativas do Supabase, piscando o mapa ou relógio em tempo real na tela do usuário.

---
**Fim do Documento de Apresentação.**
