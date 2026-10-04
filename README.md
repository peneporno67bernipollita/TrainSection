# TrainSection

App de entrenamiento: rutina «Plan Fase 1», registro de series con temporizador de descanso, calendario, check-ins con fotos cada 14 días, progreso (peso, medidas, fuerza y fotos), menús que rotan cada 2 semanas y opción de compartir rutinas mediante un enlace o un código QR. Funciona sin conexión y los datos se guardan solo en cada móvil.

## Instalar

- **iPhone:** abre https://peneporno67bernipollita.github.io/TrainSection/ en Safari → Compartir → «Añadir a pantalla de inicio».
- **Android:** abre la misma dirección en Chrome → «Instalar app». También puedes usar la APK.

## Publicar la web (solo una vez)

En GitHub: Settings → Pages → Build and deployment → Source: **GitHub Actions**. A partir de ahí, cada `git push` a `main` publica la app.

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run build
```

## APK de Android

Necesita Java 21 y el SDK de Android:

```powershell
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\jdk-21.0.12.1+1"
npm run android:apk
```

La APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.
