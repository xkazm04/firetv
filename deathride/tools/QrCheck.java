import java.io.File;
import javax.imageio.ImageIO;
import com.google.zxing.*;
import com.google.zxing.common.HybridBinarizer;
public class QrCheck {
    public static void main(String[] args) throws Exception {
        for (String file : args) {
            var image = ImageIO.read(new File(file));
            int width=image.getWidth(), height=image.getHeight();
            int[] pixels=image.getRGB(0,0,width,height,null,0,width);
            var source=new RGBLuminanceSource(width,height,pixels);
            var result=new MultiFormatReader().decode(new BinaryBitmap(new HybridBinarizer(source)));
            if (!result.getText().matches("http://[0-9.]+:8765/\\?pin=[0-9]{4}")) throw new AssertionError(result.getText());
            System.out.println(file+": decoded "+result.getText());
        }
    }
}
