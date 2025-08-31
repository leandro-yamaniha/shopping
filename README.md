# 🛍️ Shopping App - Full-Stack E-commerce

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Pass-success.svg)](#testing)

## 🎯 Visão Geral

Aplicação completa de e-commerce com **arquitetura reativa moderna**, desenvolvida com **Spring WebFlux** no backend e **React Native** no frontend mobile. O projeto demonstra as melhores práticas de desenvolvimento full-stack com testes abrangentes e integração completa.

## 🏗️ Arquitetura

### 🚀 Backend (Spring WebFlux)
- **Java 21** com **Spring Boot 3.5.5**
- **Spring WebFlux** - programação reativa não-bloqueante
- **PostgreSQL 15** com R2DBC para acesso reativo
- **APIs mobile-otimizadas** com DTOs específicos
- **JWT Authentication** e autorização baseada em roles
- **Docker** com otimizações CDS e layered JARs

### 📱 Frontend Mobile (React Native + Expo)
- **React Native 0.72** com **Expo SDK 49**
- **TypeScript** para type safety completo
- **React Navigation** para navegação nativa
- **Context API** para gerenciamento de estado
- **Axios** para integração com APIs
- **Compatibilidade iOS/Android**

### 🌐 Frontend Web (React)
- **React 18** com **TypeScript**
- **Responsive design** mobile-first
- **Modern UI/UX** com componentes reutilizáveis

## 📦 Estrutura do Projeto

```
shopping-app/
├── backend/                    # Spring WebFlux + Java 21
│   ├── src/main/java/com/shopping/
│   │   ├── controller/         # Controllers REST e Mobile API
│   │   ├── service/           # Serviços de negócio reativos
│   │   ├── model/             # Entidades JPA
│   │   ├── dto/               # DTOs otimizados para mobile
│   │   ├── config/            # Configurações (Security, CORS, Cache)
│   │   └── repository/        # Repositórios R2DBC
│   ├── src/test/java/         # Testes unitários e integração
│   ├── pom.xml               # Dependências Maven
│   └── docker/               # Dockerfiles otimizados
├── frontend-web/              # React Web + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   └── context/          # Context API para estado
│   ├── package.json
│   └── Dockerfile
├── frontend-mobile/           # React Native + Expo
│   ├── src/
│   │   ├── components/       # Componentes mobile (ProductCard, etc)
│   │   ├── screens/          # Telas (Home, Products, Cart, Orders)
│   │   ├── context/          # CartContext para estado global
│   │   └── services/         # API services com Axios
│   ├── ios/                  # Projeto iOS nativo
│   ├── demo/                 # Demo interativo para testes
│   ├── app.json             # Configuração Expo
│   └── package.json
├── test-mvvm/                 # Testes MVVM arquiteturais
│   ├── models/               # Models de teste
│   ├── viewmodels/           # ViewModels de teste
│   ├── tests/                # Testes unitários e integração
│   └── views/                # Views de teste
├── database/                  # Scripts SQL iniciais
├── nginx/                     # Configuração proxy reverso
├── docker-compose.yml         # Orquestração completa
├── test-integration.js        # Testes de integração E2E
└── README.md
```

## 🚀 Funcionalidades Implementadas

### ✅ Core Features
- **Catálogo de produtos** com categorias dinâmicas
- **Carrinho de compras reativo** com Context API
- **Sistema de pedidos** com fluxo completo
- **APIs mobile-otimizadas** com DTOs específicos
- **Busca e filtros** em tempo real

### 🔐 Autenticação JWT
- **Sistema completo de autenticação** com JWT tokens
- **Login/Register** com validação e criptografia BCrypt
- **Sessões persistentes** com AsyncStorage no mobile
- **Middleware de autenticação** automático nas requisições
- **Telas de login/registro** com UI moderna no React Native
- **Gerenciamento de estado** com AuthContext
- **Cache de tokens** para performance otimizada
- **Expiração automática** de tokens (24h)
- **Gerenciamento de estado** reativo

### ✅ Recursos Avançados
- **APIs reativas** com Spring WebFlux (não-bloqueantes)
- **App mobile nativo** React Native + Expo
- **Interface web responsiva** com design moderno
- **Containerização completa** Docker + Docker Compose
- **Testes abrangentes** (68 testes, 77.7% cobertura)
- **Integração E2E** (100% taxa de sucesso)
- **CORS configurado** para desenvolvimento cross-origin
- **Security otimizada** com endpoints públicos para mobile

### 🔄 Recursos Reativos
- **WebFlux Reactive Streams** para alta performance
- **R2DBC** para acesso não-bloqueante ao banco
- **Reactive Controllers** com Mono/Flux
- **Cache reativo** para otimização de performance

## 🛠️ Como Executar

### 🚀 Quick Start (Recomendado)
```bash
# 1. Subir infraestrutura (PostgreSQL)
docker-compose up -d postgres

# 2. Executar backend reativo
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Executar frontend mobile
cd frontend-mobile
npm install
npx expo start

# 4. Testar integração
node test-integration.js
```

### 🐳 Desenvolvimento Completo (Docker)
```bash
# Subir todos os serviços
docker-compose up -d

# Acessar aplicações
# Backend API: http://localhost:8080
# Frontend Web: http://localhost:3000
# Mobile Demo: frontend-mobile/demo/mobile-demo.html
# PostgreSQL: localhost:5432
# Expo DevTools: http://localhost:8090
```

### 🔧 Desenvolvimento Individual
```bash
# Backend (Spring WebFlux)
cd backend
mvn clean install
mvn spring-boot:run

# Frontend Web (React)
cd frontend-web
npm install && npm start

# Frontend Mobile (React Native + Expo)
cd frontend-mobile
npm install && npx expo start

# Testes MVVM
cd test-mvvm
npm install && npm test
```

### 📱 Executar no Dispositivo
```bash
# iOS Simulator
cd frontend-mobile && npm run ios

# Android Emulator
cd frontend-mobile && npm run android

# Expo Go (Recomendado)
cd frontend-mobile && npx expo start
# Escaneie o QR code com Expo Go
```

## 📊 Stack Tecnológico

### 🚀 Backend
| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **Java** | 21 | LTS com Virtual Threads |
| **Spring Boot** | 3.5.5 | Framework base |
| **Spring WebFlux** | 6.x | Programação reativa |
| **R2DBC** | Latest | Acesso reativo ao banco |
| **PostgreSQL** | 15 | Banco de dados principal |
| **Maven** | 3.9+ | Gerenciamento de dependências |
| **Docker** | Latest | Containerização |

### 📱 Frontend Mobile
| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **React Native** | 0.72 | Framework mobile nativo |
| **Expo** | SDK 49 | Plataforma de desenvolvimento |
| **TypeScript** | 5.x | Type safety |
| **React Navigation** | 6.x | Navegação nativa |
| **Axios** | Latest | Cliente HTTP |
| **Context API** | Built-in | Gerenciamento de estado |

### 🌐 Frontend Web
| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **React** | 18 | Library de UI |
| **TypeScript** | 5.x | Type safety |
| **Vite** | Latest | Build tool moderna |

### 🧪 Testing
| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **Jest** | Latest | Framework de testes |
| **JUnit 5** | Latest | Testes Java |
| **Testcontainers** | Latest | Testes de integração |
| **Custom MVVM** | - | Arquitetura de testes |

## 🎯 Status do Projeto

### ✅ Concluído (100%)
- [x] **Estrutura inicial** - Arquitetura completa definida
- [x] **Docker otimizado** - CDS, layered JARs, multi-stage builds
- [x] **Backend reativo** - Spring WebFlux implementado
- [x] **Modelos de dados** - Entidades JPA com relacionamentos
- [x] **APIs REST reativas** - Controllers com Mono/Flux
- [x] **APIs mobile-otimizadas** - DTOs específicos para mobile
- [x] **Frontend Web** - React + TypeScript funcional
- [x] **Frontend Mobile** - React Native + Expo completo
- [x] **Integração E2E** - Frontend ↔ Backend funcionando
- [x] **Testes abrangentes** - MVVM + Integração (100% pass)
- [x] **CORS configurado** - Cross-origin para desenvolvimento
- [x] **Security configurada** - Endpoints públicos para mobile
- [x] **Demo interativo** - Interface de testes funcional

### 🔄 Em Desenvolvimento
- [ ] **Autenticação JWT** - Sistema completo de auth
- [ ] **Testes E2E Cypress** - Testes end-to-end automatizados
- [ ] **CI/CD Pipeline** - Deploy automatizado

### 📊 Métricas de Qualidade
- **Testes MVVM**: 68 testes, 77.7% cobertura
- **Integração**: 6/6 testes passando (100%)
- **Arquivos**: 77 arquivos, 32.469 linhas de código
- **Performance**: APIs reativas não-bloqueantes

## 📱 Frontend Mobile - React Native + Expo

### ✅ Funcionalidades Implementadas
- **Navegação nativa** com React Navigation (tabs + stack)
- **Telas completas**: Home, Products, ProductDetail, Cart, Orders
- **Carrinho reativo** com Context API e persistência
- **Componentes reutilizáveis**: ProductCard, LoadingSpinner, EmptyState
- **Integração API** real com backend Spring WebFlux
- **UI/UX mobile-first** com design system consistente
- **TypeScript** para type safety completo
- **Estados de loading** e tratamento de erros
- **Busca em tempo real** de produtos
- **Compatibilidade iOS/Android** via Expo

### 🚀 Executar Mobile App
```bash
cd frontend-mobile
npm install

# Desenvolvimento com Expo
npx expo start

# iOS Simulator (requer Xcode)
npm run ios

# Android Emulator (requer Android Studio)
npm run android

# Demo no Browser
open demo/mobile-demo.html
```

### 📱 Testar no Dispositivo
1. **Instale o Expo Go** no seu smartphone
2. **Execute** `npx expo start` no terminal
3. **Escaneie o QR code** com:
   - **Android**: Expo Go app
   - **iOS**: Camera nativa ou Expo Go

### 🔧 Troubleshooting iOS
Se encontrar problemas com o build iOS (boost checksum), consulte:
- `fix-ios-build.md` - Guia completo de soluções
- `demo/mobile-demo.html` - Demo funcional no browser

## 🧪 Testing

### 🎯 MVVM Test Suite
```bash
cd test-mvvm
npm install
npm test

# Executar com coverage
npm run test:coverage

# Executar testes específicos
npm test -- --testNamePattern="Cart"
```

**Resultados**: 68 testes, 77.7% cobertura, 100% pass rate

### 🔗 Integration Tests
```bash
# Testar integração Frontend ↔ Backend
node test-integration.js

# Executar testes específicos
node test-integration.js --verbose
```

**Resultados**: 6/6 testes passando, 100% taxa de sucesso

### 📊 Test Coverage
- **Models**: 85% cobertura
- **ViewModels**: 78% cobertura  
- **Integration**: 100% endpoints testados
- **E2E Flow**: Shopping completo validado

## 🔗 API Endpoints

### 📱 Mobile API (`/api/mobile/*`)
```bash
# Health Check
GET /api/mobile/health

# Products
GET /api/mobile/products
GET /api/mobile/products?search=phone
GET /api/mobile/products?category=electronics
GET /api/mobile/products/{id}

# Categories
GET /api/mobile/categories

# Cart (requer autenticação)
GET /api/mobile/cart/{userId}
POST /api/mobile/cart/{userId}/add
DELETE /api/mobile/cart/{userId}/remove/{productId}
DELETE /api/mobile/cart/{userId}/clear
```

### 🌐 Web API (`/api/*`)
```bash
# Products
GET /api/products
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}

# Orders
GET /api/orders
POST /api/orders
GET /api/orders/{id}

# Users
GET /api/users
POST /api/users
```

## 🚀 Deploy

### 🐳 Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy stack completo
docker-compose -f docker-compose.prod.yml up -d
```

### ☁️ Cloud Deploy
```bash
# Backend (Spring Boot)
./mvnw clean package -Pproduction
java -jar target/shopping-backend-1.0.0.jar

# Frontend Web
cd frontend-web && npm run build

# Mobile (Expo)
cd frontend-mobile && expo build:android
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'feat: adicionar nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Leandro Yamaniha**
- GitHub: [@leandro-yamaniha](https://github.com/leandro-yamaniha)
- LinkedIn: [leandro-yamaniha](https://linkedin.com/in/leandro-yamaniha)

---

⭐ **Star este repositório** se ele foi útil para você!
