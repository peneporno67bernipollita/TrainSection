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

Necesita Java 21 y el SDK de Android (plataforma 36):

```powershell
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\jdk-21.0.12.1+1"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm run android:apk
```

La APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

- Se firma con la clave de depuración de este PC (`%USERPROFILE%\.android\debug.keystore`). Para instalar una versión nueva encima sin perder los datos, compílala en el mismo PC o copia ese archivo al nuevo.
- Si Gradle falla con «Unable to establish loopback connection», ejecuta antes `$env:JAVA_TOOL_OPTIONS = "-Djdk.net.unixdomain.tmpdir=C:\no-afunix"`.
- Iconos: `npm run icons` regenera los de la web y los de Android.

Lo propio de la app Android: el botón «atrás» cierra diálogos y vuelve de pantalla, la pantalla no se apaga durante el entreno, el check-in deja elegir entre cámara y galería, y los recordatorios se abren directamente en la app de calendario.
