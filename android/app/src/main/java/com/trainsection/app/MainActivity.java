package com.trainsection.app;

import android.os.Bundle;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OpenFilePlugin.class);
        super.onCreate(savedInstanceState);
        // Paint the web view with the app background (light or dark, like the
        // phone) so there is no white or black flash while the page loads.
        getBridge().getWebView().setBackgroundColor(ContextCompat.getColor(this, R.color.app_background));
    }
}
