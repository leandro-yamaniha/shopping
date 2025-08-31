#!/bin/bash

# Shopping App MVVM Test Runner
# Executa todos os testes do sistema MVVM

set -e

echo "🛍️  Shopping App - MVVM Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Por favor, instale Node.js primeiro."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado. Por favor, instale npm primeiro."
    exit 1
fi

print_status "Verificando dependências..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências..."
    npm install
    print_success "Dependências instaladas com sucesso!"
else
    print_status "Dependências já instaladas."
fi

# Function to run specific test suite
run_test_suite() {
    local suite_name=$1
    local test_pattern=$2
    
    print_status "Executando $suite_name..."
    
    if npm run test -- --testPathPattern="$test_pattern" --verbose; then
        print_success "$suite_name concluídos com sucesso!"
        return 0
    else
        print_error "$suite_name falharam!"
        return 1
    fi
}

# Parse command line arguments
case "${1:-all}" in
    "unit")
        print_status "Executando apenas testes unitários..."
        run_test_suite "Testes Unitários" "unit"
        ;;
    "integration")
        print_status "Executando apenas testes de integração..."
        run_test_suite "Testes de Integração" "integration"
        ;;
    "coverage")
        print_status "Executando testes com cobertura..."
        npm run test:coverage
        print_success "Relatório de cobertura gerado em ./coverage/"
        ;;
    "watch")
        print_status "Executando testes em modo watch..."
        npm run test:watch
        ;;
    "runner")
        print_status "Iniciando Test Runner web..."
        print_status "Acesse http://localhost:8083 para ver a interface de testes"
        npm run test:runner
        ;;
    "all"|*)
        print_status "Executando suite completa de testes..."
        
        # Run unit tests
        if run_test_suite "Testes Unitários" "unit"; then
            UNIT_PASSED=true
        else
            UNIT_PASSED=false
        fi
        
        # Run integration tests
        if run_test_suite "Testes de Integração" "integration"; then
            INTEGRATION_PASSED=true
        else
            INTEGRATION_PASSED=false
        fi
        
        # Summary
        echo ""
        echo "📊 Resumo dos Testes"
        echo "==================="
        
        if [ "$UNIT_PASSED" = true ]; then
            print_success "✅ Testes Unitários: APROVADOS"
        else
            print_error "❌ Testes Unitários: FALHARAM"
        fi
        
        if [ "$INTEGRATION_PASSED" = true ]; then
            print_success "✅ Testes de Integração: APROVADOS"
        else
            print_error "❌ Testes de Integração: FALHARAM"
        fi
        
        if [ "$UNIT_PASSED" = true ] && [ "$INTEGRATION_PASSED" = true ]; then
            print_success "🎉 Todos os testes passaram!"
            exit 0
        else
            print_error "💥 Alguns testes falharam!"
            exit 1
        fi
        ;;
esac
