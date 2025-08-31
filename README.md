# Shopping App - E-commerce Completo

## 🛍️ Visão Geral
Aplicativo completo de e-commerce com backend reativo e frontends multiplataforma.

## 🏗️ Arquitetura

### Backend
- **Java 21** com **Spring Boot 4.0**
- **Spring WebFlux** (programação reativa)
- **PostgreSQL** como banco de dados
- **Jest** como servidor embarcado para testes
- **Docker** e **Docker Compose**

### Frontend
- **React Native** para mobile (iOS/Android)
- **React Web** para desktop/browser
- **TypeScript** para type safety

## 📦 Estrutura do Projeto

```
shopping-app/
├── backend/                 # Spring Boot 4 + Java 21
│   ├── src/main/java/
│   ├── src/test/java/
│   ├── pom.xml
│   └── Dockerfile
├── frontend-web/           # React Web
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend-mobile/        # React Native
│   ├── src/
│   ├── package.json
│   └── metro.config.js
├── docker-compose.yml
└── README.md
```

## 🚀 Funcionalidades

### Core Features
- ✅ Catálogo de produtos com categorias
- ✅ Carrinho de compras reativo
- ✅ Sistema de pedidos
- ✅ Autenticação JWT
- ✅ Gerenciamento de usuários
- ✅ Busca e filtros avançados

### Recursos Avançados
- 🔄 APIs reativas com WebFlux
- 📱 App mobile nativo
- 🌐 Interface web responsiva
- 🐳 Containerização completa
- 🧪 Testes automatizados

## 🛠️ Como Executar

### Desenvolvimento Completo
```bash
# Subir todos os serviços
docker-compose up -d

# Acessar aplicações
# Web: http://localhost:3000
# Mobile: Expo/Metro bundler
# API: http://localhost:8080
# PostgreSQL: localhost:5432
```

### Desenvolvimento Individual
```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend Web
cd frontend-web && npm start

# Frontend Mobile
cd frontend-mobile && npx expo start
```

## 📊 Tecnologias

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Backend | Java | 21 |
| Framework | Spring Boot | 4.0 |
| Reatividade | Spring WebFlux | Latest |
| Banco | PostgreSQL | 15 |
| Testes | Jest | Latest |
| Frontend Web | React | 18 |
| Frontend Mobile | React Native | Latest |
| Containerização | Docker | Latest |

## 🎯 Status do Projeto
- [x] Estrutura inicial
- [x] Docker otimizado (CDS, layered JARs)
- [ ] Backend reativo
- [ ] Modelos de dados
- [ ] APIs REST reativas
- [x] Frontend Web (React + TypeScript)
- [x] Frontend Mobile (React Native + Expo)
- [ ] Autenticação
- [ ] Testes
- [ ] Deploy

## 📱 Frontend Mobile - React Native

### ✅ Implementado
- **Navegação completa** com React Navigation (tabs + stack)
- **Telas principais**: Home, Products, ProductDetail, Cart, Orders
- **Carrinho reativo** com Context API
- **Componentes reutilizáveis**: ProductCard, LoadingSpinner, EmptyState
- **Serviços de API** configurados para integração com backend
- **UI/UX mobile otimizada** com design system consistente

### 🚀 Como executar o Mobile
```bash
cd frontend-mobile
npm install
npx expo start
```

Escaneie o QR code com Expo Go (Android) ou Camera (iOS)
