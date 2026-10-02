package dev.deathride.artlab;
import android.os.Bundle;
import android.view.WindowManager;
import com.badlogic.gdx.backends.android.AndroidApplication;
import com.badlogic.gdx.backends.android.AndroidApplicationConfiguration;
public final class LabActivity extends AndroidApplication {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        AndroidApplicationConfiguration c=new AndroidApplicationConfiguration();
        c.useImmersiveMode=true;c.useAccelerometer=false;c.useCompass=false;c.useGyroscope=false;c.useWakelock=false;
        c.r=8;c.g=8;c.b=8;c.a=8;c.depth=0;c.stencil=0;c.numSamples=0;
        initialize(new SurfaceLab(getIntent().getIntExtra("mode",0),getIntent().getIntExtra("style",0),getIntent().getBooleanExtra("auto",true),getIntent().getStringExtra("run")),c);
    }
}
