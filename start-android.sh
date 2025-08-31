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
