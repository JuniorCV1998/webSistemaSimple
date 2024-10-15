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
npx cap open android
npx cap open ios

/* CORREO CAMBIOS NEUVOS IMPLEMENTADOS LUEGO DE CORRER EL APK */
ng build --configuration production
npx cap sync 
Run: Android studio