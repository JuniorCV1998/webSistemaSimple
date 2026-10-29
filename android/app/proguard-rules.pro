# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ===== Capacitor (la app nativa llama a los plugins por nombre y por anotaciones) =====
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod, SourceFile, LineNumberTable
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public <methods>;
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
}

# Puente JavaScript <-> nativo del WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Plugins Cordova (si se agregan) y la actividad principal
-keep class org.apache.cordova.** { *; }
-keep class com.ssimple.app.MainActivity { *; }

# Plugins usados por la app (huella, edge-to-edge)
-keep class ee.forgr.biometric.** { *; }
-keep class io.capawesome.capacitorjs.plugins.** { *; }
