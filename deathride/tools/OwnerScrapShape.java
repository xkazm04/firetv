import dev.deathride.core.*;
import java.nio.file.*;
import java.util.*;

/** Remeasure the installed owner choice; compare it with every other retained composer road. */
public final class OwnerScrapShape {
    public static void main(String[] args) throws Exception {
        Course c=Courses.INSTANCE.getAll().stream().filter(x->x.getId().equals("scrap-7-e")).findFirst().orElseThrow();
        CandidateSlot slot=CandidateAuthor.INSTANCE.getSlots().stream().filter(x->x.getId().equals("scrap-7")).findFirst().orElseThrow();
        Course composed=CandidateAuthor.INSTANCE.compose(slot,Files.readString(Path.of("tracks/candidates/recipes/scrap-7-e.csv")),c.getId()).getCourse();
        var installed=TrackLabCodec.INSTANCE.csv(c);var authored=new HashMap<>(TrackLabCodec.INSTANCE.csv(composed));
        // Composer keeps the source-base ID; bundle packing renames only shared-table keys.
        for(String key:List.of("features","obstacles"))authored.put(key,authored.get(key).replaceAll("(?m)^"+composed.getId()+",",c.getId()+","));
        if(!installed.equals(authored))throw new IllegalStateException("Installed/composed mismatch");
        TrackShape shape=TrackShapeReportKt.trackShape(c);
        var gates=TrackShapeReportKt.shapeGates(shape.getMetrics());
        if(!gates.stream().allMatch(g->"pass".equals(g.get("status"))) || !TrackLinter.INSTANCE.errors(c).isEmpty())throw new IllegalStateException("Shape/lint failure");
        if(shape.getCorners().size()<8 || shape.getMetrics().get("absoluteTurnDegrees")<1200)throw new IllegalStateException("Boss complexity floor");
        List<Map<String,Object>> pairs=new ArrayList<>();
        for(Course other:Courses.INSTANCE.getPlayable()) {
            if(other.getId().equals(c.getId()) || other.getId().equals("runoff"))continue;
            var metrics=TrackShapeReportKt.shapeSimilarity(shape,TrackShapeReportKt.trackShape(other));
            boolean similar=OutlineRules.INSTANCE.similar(metrics);
            if(similar)throw new IllegalStateException("Similar to "+other.getId());
            pairs.add(Map.of("other",other.getId(),"metrics",metrics,"similar",similar));
        }
        var result=Map.of("candidate",c.getId(),"shape",shape.data(),"gates",gates,"installedEqualsComposer",true,"otherRetainedComparisons",pairs,"region",c.getRegion().getId());
        Files.writeString(Path.of(args[0]),TrackQuality.INSTANCE.json(result));
        System.out.println("Installed scrap-7-e: shape/lint/boss complexity pass; "+pairs.size()+" distinct retained peers; "+c.getRegion().getId());
    }
}
