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
