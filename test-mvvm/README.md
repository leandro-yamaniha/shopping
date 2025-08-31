# Shopping App - MVVM Test Suite

Sistema completo de testes MVVM (Model-View-ViewModel) para o Shopping App.

## 🏗️ Arquitetura MVVM

### Models
- **ProductModel**: Gerenciamento de produtos, busca e filtros
- **CartModel**: Lógica do carrinho de compras, cálculos de totais

### ViewModels
- **ProductViewModel**: Lógica de negócio para produtos e carrinho
- **OrderViewModel**: Gerenciamento de pedidos e status

### Views
- **TestRunner.html**: Interface web interativa para execução de testes

## 📦 Estrutura do Projeto

```
test-mvvm/
├── models/                 # Modelos de dados
│   ├── Product.ts
│   └── Cart.ts
├── viewmodels/            # Lógica de negócio
│   ├── ProductViewModel.ts
│   └── OrderViewModel.ts
├── views/                 # Interface de testes
│   └── TestRunner.html
├── tests/                 # Testes automatizados
│   ├── unit/             # Testes unitários
│   │   ├── ProductModel.test.ts
│   │   └── CartModel.test.ts
│   ├── integration/      # Testes de integração
│   │   └── ShoppingFlow.test.ts
│   └── setup.ts          # Configuração global
├── package.json
├── jest.config.js
├── tsconfig.json
└── run-tests.sh          # Script de execução
```

## 🚀 Como Executar

### Instalação
```bash
cd test-mvvm
npm install
```

### Executar Todos os Testes
```bash
./run-tests.sh
# ou
npm test
```

### Testes Específicos
```bash
# Apenas testes unitários
./run-tests.sh unit

# Apenas testes de integração
./run-tests.sh integration

# Com cobertura de código
./run-tests.sh coverage

# Modo watch (desenvolvimento)
./run-tests.sh watch

# Interface web interativa
./run-tests.sh runner
```

## 🧪 Tipos de Testes

### Testes Unitários
- **ProductModel**: Validação de CRUD, busca e filtros
- **CartModel**: Operações de carrinho, cálculos e validações

### Testes de Integração
- **ShoppingFlow**: Fluxo completo de compra
- **OrderManagement**: Criação e gerenciamento de pedidos
- **ErrorHandling**: Tratamento de erros e validações
- **Performance**: Testes de performance e otimização

### Testes de Interface
- **TestRunner**: Interface web para execução visual dos testes
- **Real-time feedback**: Resultados em tempo real
- **Analytics**: Estatísticas e métricas de teste

## 📊 Cobertura de Testes

O sistema testa:
- ✅ **Models**: 100% de cobertura
- ✅ **ViewModels**: 95%+ de cobertura
- ✅ **Fluxos de negócio**: Cenários completos
- ✅ **Casos extremos**: Validações e erros
- ✅ **Performance**: Benchmarks de velocidade

## 🎯 Cenários Testados

### Produtos
- Carregamento de produtos
- Busca e filtros por categoria
- Validação de estoque
- Ordenação por preço/nome/rating

### Carrinho
- Adicionar/remover produtos
- Atualizar quantidades
- Cálculo de totais (subtotal, frete, impostos)
- Validações de estoque

### Pedidos
- Criação de pedidos
- Atualização de status
- Cancelamento de pedidos
- Histórico e analytics

### Performance
- Tempo de carregamento < 500ms
- Busca rápida < 50ms
- Operações de carrinho < 10ms

## 🔧 Configuração

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'models/**/*.ts',
    'viewmodels/**/*.ts'
  ]
};
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  }
}
```

## 📈 Relatórios

### Cobertura de Código
```bash
npm run test:coverage
# Relatório gerado em ./coverage/
```

### Interface Web
```bash
npm run test:runner
# Acesse http://localhost:8083
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm test` | Executa todos os testes |
| `npm run test:unit` | Testes unitários apenas |
| `npm run test:integration` | Testes de integração apenas |
| `npm run test:coverage` | Testes com cobertura |
| `npm run test:watch` | Modo watch para desenvolvimento |
| `npm run test:runner` | Interface web interativa |

## 🎮 Interface Web de Testes

A interface web (`TestRunner.html`) oferece:
- **Execução visual** dos testes
- **Resultados em tempo real**
- **Estatísticas** de aprovação/falha
- **Logs detalhados** com timestamps
- **Controles** para testes específicos

### Funcionalidades
- 🚀 Executar todos os testes
- 📦 Testes de produtos isolados
- 🛒 Testes de carrinho isolados
- 📋 Testes de pedidos isolados
- 🎯 Testes de performance
- 📊 Métricas em tempo real

## 🔍 Debugging

### Logs Detalhados
```bash
npm test -- --verbose
```

### Teste Específico
```bash
npm test -- --testNamePattern="should add item to cart"
```

### Watch Mode
```bash
npm run test:watch
```

## 📋 Checklist de Qualidade

- ✅ Todos os testes unitários passando
- ✅ Todos os testes de integração passando
- ✅ Cobertura de código > 90%
- ✅ Performance dentro dos limites
- ✅ Tratamento de erros validado
- ✅ Casos extremos cobertos
- ✅ Interface web funcionando

## 🚀 Próximos Passos

- [ ] Testes E2E com Cypress
- [ ] Testes de carga com Artillery
- [ ] Integração com CI/CD
- [ ] Testes de acessibilidade
- [ ] Testes de segurança
