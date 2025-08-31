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
