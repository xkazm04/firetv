package dev.deathride.artlab;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration;
public final class DesktopLauncher {
    public static void main(String[] args) {
        Lwjgl3ApplicationConfiguration c=new Lwjgl3ApplicationConfiguration();
        c.setTitle("Death Ride Surface Lab");c.setWindowedMode(1920,1080);c.useVsync(true);c.setForegroundFPS(60);c.setInitialVisible(false);
        new Lwjgl3Application(new SurfaceLab(args.length>0?Integer.parseInt(args[0]):0,args.length>1?Integer.parseInt(args[1]):0,true,args.length>2?args[2]:"desktop"),c);
    }
}
