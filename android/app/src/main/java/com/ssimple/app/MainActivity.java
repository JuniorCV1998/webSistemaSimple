package com.ssimple.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Accede al WebView de Capacitor
    WebView webView = (WebView) this.bridge.getWebView();
    WebSettings settings = webView.getSettings();

    // Desactiva el zoom
    settings.setBuiltInZoomControls(false);  // No controles nativos de zoom
    settings.setDisplayZoomControls(false);  // Oculta los íconos de zoom
    settings.setSupportZoom(false);          // Desactiva zoom por completo
  }
}

