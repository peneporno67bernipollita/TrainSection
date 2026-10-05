package com.trainsection.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

/**
 * Opens a file from the app's cache folder with the app that handles its type,
 * e.g. the reminders .ics with the calendar. Calendar apps import .ics files
 * this way but don't show up in the share sheet.
 */
@CapacitorPlugin(name = "OpenFile")
public class OpenFilePlugin extends Plugin {

    @PluginMethod
    public void open(PluginCall call) {
        String name = call.getString("name");
        String mime = call.getString("mime", "*/*");
        if (name == null || name.isEmpty() || name.contains("/") || name.contains("\\")) {
            call.reject("Invalid file name");
            return;
        }
        File file = new File(getContext().getCacheDir(), name);
        if (!file.isFile()) {
            call.reject("File not found");
            return;
        }
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
        Intent intent = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, mime).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            getActivity().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("No app can open this file", "NO_APP");
        }
    }
}
