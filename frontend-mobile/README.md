# Shopping App Mobile - React Native

Aplicativo mobile do Shopping App desenvolvido com React Native e Expo.

## 🚀 Tecnologias

- **React Native** com **Expo SDK 49**
- **TypeScript** para type safety
- **React Navigation** para navegação
- **Context API** para gerenciamento de estado
- **Axios** para chamadas HTTP
- **Expo Vector Icons** para ícones

## 📱 Funcionalidades

### Telas Implementadas
- **Home**: Página inicial com categorias e produtos em destaque
- **Products**: Lista de produtos com busca e filtros por categoria
- **Product Detail**: Detalhes do produto com opção de adicionar ao carrinho
- **Cart**: Carrinho de compras com gerenciamento de quantidades
- **Orders**: Histórico de pedidos do usuário

### Recursos
- ✅ Navegação por tabs e stack navigation
- ✅ Carrinho de compras reativo
- ✅ Busca e filtros de produtos
- ✅ Interface mobile otimizada
- ✅ Componentes reutilizáveis
- ✅ Gerenciamento de estado global
- ✅ Integração preparada para API backend

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 16+
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app no seu dispositivo móvel

### Instalação
```bash
# Navegar para o diretório
cd frontend-mobile

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

### Executar no Dispositivo
1. Instale o **Expo Go** no seu smartphone
2. Execute `npm start` no terminal
3. Escaneie o QR code com o Expo Go (Android) ou Camera (iOS)

### Executar no Simulador
```bash
# iOS Simulator (macOS apenas)
npm run ios

# Android Emulator
npm run android

# Web (para desenvolvimento)
npm run web
```

## 📁 Estrutura do Projeto

```
frontend-mobile/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ProductCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── context/            # Context API
│   │   └── CartContext.tsx
│   ├── screens/            # Telas da aplicação
│   │   ├── HomeScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   └── OrdersScreen.tsx
│   └── services/           # Serviços e API
│       └── api.ts
├── App.tsx                 # Componente principal
├── app.json               # Configuração do Expo
├── package.json           # Dependências
└── tsconfig.json          # Configuração TypeScript
```

## 🔗 Integração com Backend

O app está configurado para se conectar com o backend Spring Boot:

- **Base URL**: `http://localhost:8080/api`
- **Endpoints**: Produtos, Pedidos, Autenticação
- **Mock Data**: Dados simulados para desenvolvimento offline

Para conectar com o backend real:
1. Certifique-se que o backend está rodando na porta 8080
2. Atualize a `API_BASE_URL` em `src/services/api.ts`
3. Substitua os mock data pelas chamadas reais da API

## 🎨 Design System

### Cores Principais
- **Primary**: #007AFF (iOS Blue)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)
- **Error**: #FF3B30 (Red)
- **Background**: #F2F2F7 (Light Gray)

### Tipografia
- **Títulos**: SF Pro Display (iOS) / Roboto (Android)
- **Corpo**: SF Pro Text (iOS) / Roboto (Android)

## 📦 Build para Produção

```bash
# Build para iOS (requer macOS e Xcode)
expo build:ios

# Build para Android
expo build:android

# Ou usar EAS Build (recomendado)
npx eas build --platform all
```

## 🧪 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários
- [ ] Implementar notificações push
- [ ] Adicionar modo offline
- [ ] Integrar pagamentos
- [ ] Otimizar performance com lazy loading
