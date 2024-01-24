package land.gno.rootdir;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
public class RootDirModule extends ReactContextBaseJavaModule {
    private final static String nameFolder = "gnonative";

    public RootDirModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public String getRootDir() {
        return getReactApplicationContext().getFilesDir().getAbsolutePath();
    }

    @NonNull
    @Override
    public String getName() {
        return "RootDir";
    }

    @ReactMethod
    public void get(Promise promise) {
        promise.resolve(getRootDir());
    }
}

