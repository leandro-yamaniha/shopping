#!/bin/bash

# 📱 Setup Emuladores macOS - Shopping App
# Configura iOS Simulator e Android AVD no macOS

set -e

echo "🍎 Configurando Emuladores para macOS"
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar se estamos no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "Este script é apenas para macOS"
    exit 1
fi

print_status "Verificando dependências..."

# 1. Verificar Homebrew
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew não encontrado. Instalando..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    print_success "Homebrew já instalado"
fi

# 2. Verificar Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js não encontrado. Instalando via Homebrew..."
    brew install node
else
    print_success "Node.js já instalado ($(node --version))"
fi

# 3. Verificar Watchman (recomendado para React Native)
if ! command -v watchman &> /dev/null; then
    print_warning "Watchman não encontrado. Instalando..."
    brew install watchman
else
    print_success "Watchman já instalado"
fi

# 4. Verificar Xcode Command Line Tools
if ! xcode-select -p &> /dev/null; then
    print_warning "Xcode Command Line Tools não instalado"
    print_status "Execute: xcode-select --install"
    print_status "Aguarde a instalação e execute este script novamente"
    exit 1
else
    print_success "Xcode Command Line Tools instalado"
fi

# 5. Verificar se Xcode está instalado
if ! command -v xcrun &> /dev/null; then
    print_warning "Xcode não encontrado na App Store"
    print_status "Para iOS Simulator, instale Xcode da App Store"
    print_status "Continuando apenas com Android..."
    XCODE_AVAILABLE=false
else
    print_success "Xcode disponível"
    XCODE_AVAILABLE=true
fi

# 6. Verificar Android Studio
if [ ! -d "/Applications/Android Studio.app" ]; then
    print_warning "Android Studio não encontrado"
    print_status "Baixe em: https://developer.android.com/studio"
    print_status "Ou instale via Homebrew: brew install --cask android-studio"
    ANDROID_STUDIO_AVAILABLE=false
else
    print_success "Android Studio encontrado"
    ANDROID_STUDIO_AVAILABLE=true
fi

# 7. Configurar variáveis de ambiente Android
print_status "Configurando variáveis de ambiente Android..."

ANDROID_HOME="$HOME/Library/Android/sdk"
if [ -d "$ANDROID_HOME" ]; then
    print_success "ANDROID_HOME encontrado: $ANDROID_HOME"
else
    print_warning "ANDROID_HOME não encontrado. Configure após instalar Android Studio"
fi

# Adicionar ao shell profile
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ -n "$SHELL_PROFILE" ]; then
    if ! grep -q "ANDROID_HOME" "$SHELL_PROFILE"; then
        print_status "Adicionando variáveis Android ao $SHELL_PROFILE"
        cat >> "$SHELL_PROFILE" << 'EOF'

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
EOF
        print_success "Variáveis adicionadas. Execute: source $SHELL_PROFILE"
    else
        print_success "Variáveis Android já configuradas"
    fi
fi

# 8. Instalar Expo CLI globalmente
print_status "Instalando Expo CLI..."
if npm list -g @expo/cli &> /dev/null; then
    print_success "Expo CLI já instalado"
else
    npm install -g @expo/cli
    print_success "Expo CLI instalado"
fi

# 9. Verificar projeto React Native
print_status "Verificando projeto frontend-mobile..."
if [ -d "frontend-mobile" ]; then
    cd frontend-mobile
    
    if [ -f "package.json" ]; then
        print_success "Projeto React Native encontrado"
        
        # Instalar dependências se necessário
        if [ ! -d "node_modules" ]; then
            print_status "Instalando dependências do projeto..."
            npm install
        fi
        
        # Verificar se é projeto Expo
        if grep -q "@expo" package.json; then
            print_success "Projeto Expo detectado"
            EXPO_PROJECT=true
        else
            print_success "Projeto React Native CLI detectado"
            EXPO_PROJECT=false
        fi
    else
        print_error "package.json não encontrado em frontend-mobile"
        exit 1
    fi
    
    cd ..
else
    print_error "Diretório frontend-mobile não encontrado"
    exit 1
fi

# 10. Criar scripts de inicialização
print_status "Criando scripts de inicialização..."

# Script para iOS
cat > start-ios.sh << 'EOF'
#!/bin/bash
echo "🍎 Iniciando iOS Simulator..."

if command -v xcrun &> /dev/null; then
    # Listar dispositivos disponíveis
    echo "Dispositivos iOS disponíveis:"
    xcrun simctl list devices | grep -E "(iPhone|iPad)" | grep -v "unavailable"
    
    # Iniciar iPhone 14 Pro por padrão
    DEVICE="iPhone 14 Pro"
    echo "Iniciando $DEVICE..."
    xcrun simctl boot "$DEVICE" 2>/dev/null || echo "Dispositivo já iniciado"
    
    # Abrir Simulator
    open -a Simulator
    
    # Navegar para projeto e iniciar
    cd frontend-mobile
    npx expo start --ios
else
    echo "❌ Xcode não instalado. Instale da App Store primeiro."
fi
EOF

# Script para Android
cat > start-android.sh << 'EOF'
#!/bin/bash
echo "🤖 Iniciando Android Emulator..."

if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
    
    # Listar AVDs disponíveis
    echo "AVDs disponíveis:"
    $ANDROID_HOME/emulator/emulator -list-avds
    
    # Tentar iniciar primeiro AVD disponível
    FIRST_AVD=$($ANDROID_HOME/emulator/emulator -list-avds | head -n 1)
    if [ -n "$FIRST_AVD" ]; then
        echo "Iniciando $FIRST_AVD..."
        $ANDROID_HOME/emulator/emulator -avd "$FIRST_AVD" &
        
        # Aguardar emulador iniciar
        echo "Aguardando emulador iniciar..."
        adb wait-for-device
        
        # Navegar para projeto e iniciar
        cd frontend-mobile
        npx expo start --android
    else
        echo "❌ Nenhum AVD encontrado. Crie um no Android Studio primeiro."
        echo "Android Studio > Tools > AVD Manager > Create Virtual Device"
    fi
else
    echo "❌ Android SDK não encontrado. Instale Android Studio primeiro."
fi
EOF

# Script para Expo Go
cat > start-expo.sh << 'EOF'
#!/bin/bash
echo "📱 Iniciando Expo Development Server..."

cd frontend-mobile

# Limpar cache se necessário
echo "Limpando cache..."
npx expo start --clear

echo ""
echo "🚀 Expo iniciado!"
echo "📱 Baixe o app 'Expo Go' no seu celular"
echo "📷 Escaneie o QR code que aparecerá"
echo ""
echo "Pressione 'w' para abrir no navegador"
echo "Pressione 'a' para Android emulator"
echo "Pressione 'i' para iOS simulator"
EOF

chmod +x start-ios.sh start-android.sh start-expo.sh

print_success "Scripts criados:"
print_success "  ./start-ios.sh - iOS Simulator"
print_success "  ./start-android.sh - Android Emulator"
print_success "  ./start-expo.sh - Expo Go (recomendado)"

# 11. Resumo final
echo ""
echo "📋 Resumo da Configuração"
echo "========================"

if [ "$XCODE_AVAILABLE" = true ]; then
    print_success "✅ iOS Simulator: Disponível"
else
    print_warning "⚠️  iOS Simulator: Instale Xcode da App Store"
fi

if [ "$ANDROID_STUDIO_AVAILABLE" = true ]; then
    print_success "✅ Android Studio: Disponível"
    print_status "   Configure um AVD: Android Studio > Tools > AVD Manager"
else
    print_warning "⚠️  Android Studio: Baixe de https://developer.android.com/studio"
fi

print_success "✅ Expo CLI: Configurado"
print_success "✅ Scripts de inicialização: Criados"

echo ""
echo "🚀 Próximos Passos:"
echo "1. Se não tem Xcode: Instale da App Store"
echo "2. Se não tem Android Studio: Instale e configure um AVD"
echo "3. Para desenvolvimento rápido: ./start-expo.sh"
echo "4. Para iOS: ./start-ios.sh"
echo "5. Para Android: ./start-android.sh"
echo ""
echo "💡 Recomendação: Use Expo Go no seu celular para melhor experiência!"
