# 📱 Configuração de Emuladores - Shopping App

## 🎯 Emuladores Recomendados

### **1. Android Studio AVD (Recomendado)**
```bash
# Configuração otimizada
Device: Pixel 6 Pro
API Level: 33 (Android 13)
Target: Google Play
RAM: 4096 MB
Internal Storage: 8 GB
Graphics: Hardware - GLES 2.0
```

### **2. iOS Simulator (macOS)**
```bash
# Dispositivos recomendados
iPhone 14 Pro (iOS 16.0+)
iPhone SE (3rd generation)
iPad Pro 12.9-inch (6th generation)
```

### **3. Genymotion (Premium)**
```bash
# Configuração rápida
Device: Samsung Galaxy S22
Android: 12.0 (API 31)
RAM: 4096 MB
```

## 🚀 Scripts de Inicialização

### **Android**
```bash
# Verificar emuladores disponíveis
emulator -list-avds

# Iniciar emulador específico
emulator -avd Pixel_6_Pro_API_33

# Expo com Android
npx expo start --android
```

### **iOS**
```bash
# Listar simuladores
xcrun simctl list devices

# Iniciar simulador específico
xcrun simctl boot "iPhone 14 Pro"

# Expo com iOS
npx expo start --ios
```

### **Expo Go (Dispositivo Físico)**
```bash
# Melhor opção para desenvolvimento rápido
npx expo start
# Escanear QR code com app Expo Go
```

## ⚡ Otimizações de Performance

### **Android AVD**
```bash
# Configurações avançadas no config.ini
hw.gpu.enabled=yes
hw.gpu.mode=host
hw.ramSize=4096
disk.dataPartition.size=8G
```

### **Metro Bundler**
```bash
# Configuração otimizada
npx expo start --clear
npx expo start --dev-client
```

## 🛠️ Ferramentas de Debug

### **Flipper**
```bash
npm install -g flipper
# Interface visual para debug
```

### **Reactotron**
```bash
npm install --save-dev reactotron-react-native
# Debug específico para React Native
```

### **Chrome DevTools**
```bash
# Debug no Chrome
npx expo start --web
```

## 📊 Comparação de Performance

| Emulador | Velocidade | Recursos | Facilidade |
|----------|------------|----------|------------|
| Android AVD | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| iOS Simulator | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Genymotion | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Expo Go | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 Recomendação Final

**Para desenvolvimento do Shopping App:**

1. **Desenvolvimento**: Expo Go no dispositivo físico
2. **Testes**: Android Studio AVD (Pixel 6 Pro)
3. **Debug**: iOS Simulator + Flipper
4. **CI/CD**: Expo EAS Build

## 🚀 Comandos Rápidos

```bash
# Setup inicial
cd frontend-mobile
npm install

# Desenvolvimento rápido
npx expo start

# Android específico
npx expo run:android

# iOS específico (macOS)
npx expo run:ios

# Web preview
npx expo start --web
```
