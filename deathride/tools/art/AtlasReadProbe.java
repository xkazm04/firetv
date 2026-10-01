import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.g2d.TextureAtlas.TextureAtlasData;
import java.io.File;
import java.util.HashSet;
import javax.imageio.ImageIO;

/** Read exported metadata with the game's actual libGDX parser, without a GL context. */
public final class AtlasReadProbe {
    public static void main(String[] args) throws Exception {
        File folder=new File(args[0]);int atlases=0,pages=0,regions=0;
        for(File file:folder.listFiles((dir,name)->name.endsWith(".atlas"))){
            TextureAtlasData data=new TextureAtlasData(new FileHandle(file),new FileHandle(folder),false);
            HashSet<String> names=new HashSet<>();
            for(var page:data.getPages()){
                var image=ImageIO.read(page.textureFile.file());
                if(image==null||image.getWidth()!=1024||image.getHeight()!=1024)throw new AssertionError("page dimensions "+page.textureFile);
            }
            for(var region:data.getRegions()){
                if(!names.add(region.name))throw new AssertionError("duplicate region "+region.name);
                if(region.rotate||region.flip||region.width<=0||region.height<=0||region.left<0||region.top<0||region.left+region.width>1024||region.top+region.height>1024)throw new AssertionError("invalid region "+region.name);
            }
            System.out.println(file.getName()+": "+data.getPages().size+" pages, "+data.getRegions().size+" regions");
            atlases++;pages+=data.getPages().size;regions+=data.getRegions().size;
        }
        if(atlases==0)throw new AssertionError("no atlases exported");
        System.out.println("PASS: "+atlases+" atlases / "+pages+" pages / "+regions+" regions parsed by libGDX 1.13.5; no GL/gameplay claim");
    }
}
