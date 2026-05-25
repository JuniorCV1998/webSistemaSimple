ng serve -o
--> Instala capacitor en Angular
npm install @capacitor/core
--> Extension de capacitor 'cli'
npm install @capacitor/cli --save-dev
--> Iniciar Capacitor
npx cap init

ng build
ó 
ng build --configuration production
---------------> dist/nameSistema <-----------------------

--> Instalar capacitor Android & Ios
npm install @capacitor/ios @capacitor/android

npx cap sync ????

--> Generar archivos Android & Compilar
npx cap add android
npx cap open android 

--> Generar archivos Ios & Compilar
npx cap add ios
npx cap open ios

/* CORREO CAMBIOS NEUVOS IMPLEMENTADOS LUEGO DE CORRER EL APK */
ng build --configuration production
npx cap sync 
Run: Android studio




/* Ejecutar desde visual */
npx cap run android

/* Correr sin test previos en Android studio */
./gradlew assembleDebug


/* POSIBLES SOLUCIONES */
-- cambiar de version
compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

/* CUANDO HAY ACTUALIZACIONES (PRIMENG, ETC) */
// limpiar node_modules
Remove-Item -Recurse -Force node_modules, package-lock.json
// reinstalar librerias
npm install
// limpiar cache
ng cache clean
// correr proyecto
ng s

--font-family: "Inter var", sans-serif;