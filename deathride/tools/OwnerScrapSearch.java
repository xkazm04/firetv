import dev.deathride.core.*;
import java.nio.file.*;
import java.util.*;

/** Strictly scoped new boss authoring; outputs scratch recipes, never installs a course. */
public final class OwnerScrapSearch {
    static boolean pass(TrackShape s) {return TrackShapeReportKt.shapeGates(s.getMetrics()).stream().allMatch(g->"pass".equals(g.get("status")));}
    static double duration(Map<String,Object> ref,int laps) {return ((Number)ref.get("standingLapSeconds")).doubleValue()+(laps-1)*((Number)ref.get("flyingLapSeconds")).doubleValue();}
    public static void main(String[] args)throws Exception {
        Path out=Path.of(args[0]);Files.createDirectories(out.resolve("recipes"));
        CandidateAuthor author=CandidateAuthor.INSTANCE;
        CandidateSlot slot=author.getSlots().stream().filter(s->s.getId().equals("scrap-7")).findFirst().orElseThrow();
        if(args.length==3) {
            String id=args[1];if(!Set.of("scrap-7-d","scrap-7-e","scrap-7-f").contains(id))throw new IllegalArgumentException("Only new scrap-7 choices may be tuned");
            List<Map<String,String>> rows=TrackQuality.INSTANCE.csv(Files.readString(out.resolve("manifest.csv")));
            Map<String,String> row=rows.stream().filter(r->id.equals(r.get("candidate"))).findFirst().orElseThrow();
            LayoutFamily family=author.getFamilies().stream().filter(f->f.getId().equals(row.get("family"))).findFirst().orElseThrow();
            double scale=Double.parseDouble(args[2]);String recipe=author.variant(family,Long.parseLong(row.get("seed")),scale);
            Course c=author.compose(slot,recipe,id).getCourse();TrackShape shape=TrackShapeReportKt.trackShape(c);
            if(!pass(shape)||!TrackLinter.INSTANCE.errors(c).isEmpty())throw new IllegalArgumentException("Tuning failed shape/physical gates");
            double seconds=duration(TrackQualitySimulationKt.qualityReference(c,1,(int)TrackQuality.INSTANCE.get("seedBase"),600),3);
            row.put("scale",""+scale);row.put("referenceSeconds",""+seconds);
            String header=Files.readAllLines(out.resolve("manifest.csv")).getFirst();StringBuilder csv=new StringBuilder(header+"\n");
            for(Map<String,String> r:rows)csv.append(String.join(",",Arrays.stream(header.split(",")).map(r::get).toList())).append('\n');
            Files.writeString(out.resolve("recipes/"+id+".csv"),recipe);Files.writeString(out.resolve("manifest.csv"),csv);
            Files.writeString(out.resolve(id+"-shape.json"),TrackQuality.INSTANCE.json(shape.data()));System.out.println("TUNED "+id+" "+seconds+" s");return;
        }
        Course base=Courses.INSTANCE.getAll().stream().filter(c->c.getId().equals(slot.getBase())).findFirst().orElseThrow();
        List<TrackShape> shapes=new ArrayList<>();
        for(Course c:Courses.INSTANCE.getAll())if(c.getRaceProfile()!=null)shapes.add(TrackShapeReportKt.trackShape(c));
        String[] families={"angled-fan","staggered-bays","nested-switchbacks"};
        StringBuilder manifest=new StringBuilder("candidate,slot,base,role,tier,laps,minSeconds,maxSeconds,family,seed,scale,referenceSeconds\n");
        Map<String,Integer> failures=new TreeMap<>();
        for(int choice=0;choice<3;choice++) {
            String id="scrap-7-"+(char)('d'+choice),family=families[choice];
            if(Files.exists(out.resolve("recipes/"+id+".csv"))) {
                shapes.add(TrackShapeReportKt.trackShape(author.compose(slot,Files.readString(out.resolve("recipes/"+id+".csv")),id).getCourse()));
                manifest.append(Files.readAllLines(out.resolve("manifest.csv")).stream().filter(line->line.startsWith(id+",")).findFirst().orElseThrow()).append('\n');
                continue;
            }
            LayoutFamily f=author.getFamilies().stream().filter(x->x.getId().equals(family)).findFirst().orElseThrow();
            boolean accepted=false;
            for(int attempt=0;attempt<2000;attempt++) {
                long seed=20261004L+choice*100003L+attempt*7919L;double scale=1;
                if(attempt%25==0)System.out.println("SEARCH "+id+" "+attempt+" "+failures);
                try {
                    String recipe=author.variant(f,seed,scale);
                    Course c=TrackComposer.INSTANCE.compile(base,recipe,false).getCourse();TrackShape shape=TrackShapeReportKt.trackShape(c);
                    if(!pass(shape))throw new IllegalArgumentException("shape");
                    if(!TrackLinter.INSTANCE.errors(c).isEmpty())throw new IllegalArgumentException("physical");
                    Map<String,Object> ref=TrackQualitySimulationKt.qualityReference(c,1,(int)TrackQuality.INSTANCE.get("seedBase"),600);
                    double seconds=duration(ref,3);
                    if(seconds<300||seconds>345) {
                        scale=Math.max(.65,Math.min(3.5,Math.pow(300/seconds,1.6)));recipe=author.variant(f,seed,scale);
                        c=TrackComposer.INSTANCE.compile(base,recipe,false).getCourse();
                        ref=TrackQualitySimulationKt.qualityReference(c,1,(int)TrackQuality.INSTANCE.get("seedBase"),600);seconds=duration(ref,3);
                    }
                    if(seconds<250||seconds>345)throw new IllegalArgumentException("pacing");
                    c=author.compose(slot,recipe,id).getCourse();shape=TrackShapeReportKt.trackShape(c);
                    if(!pass(shape))throw new IllegalArgumentException("scaled-shape");
                    if(shape.getCorners().size()<8||shape.getMetrics().get("absoluteTurnDegrees")<1200)throw new IllegalArgumentException("boss-complexity");
                    for(TrackShape prior:shapes)if(OutlineRules.INSTANCE.similar(TrackShapeReportKt.shapeSimilarity(prior,shape)))throw new IllegalArgumentException("similarity");
                    QualityGeometry g=TrackQualityGeometryKt.qualityGeometry(c);
                    if(!TrackLinter.INSTANCE.errors(c).isEmpty())throw new IllegalArgumentException("decorated-physical");
                    if(!TrackQuality.INSTANCE.gates(g.getValues(),Set.of("geometry","lap")).stream().allMatch(x->"pass".equals(x.get("status"))))throw new IllegalArgumentException("quality-geometry");
                    Files.writeString(out.resolve("recipes/"+id+".csv"),recipe);
                    manifest.append(String.join(",",id,slot.getId(),slot.getBase(),"boss","1","3","240.0","360.0",family,""+seed,""+scale,""+seconds)).append('\n');
                    Files.writeString(out.resolve("manifest.csv"),manifest.toString());
                    Files.writeString(out.resolve(id+"-shape.json"),TrackQuality.INSTANCE.json(shape.data()));
                    shapes.add(shape);accepted=true;System.out.println("DESIGNED "+id+" "+family+" "+seconds+" s "+c.getLengthM()+" m");break;
                } catch(Exception e) {String key=String.valueOf(e.getMessage()).split(":")[0];failures.merge(key,1,Integer::sum);}
            }
            if(!accepted)throw new IllegalStateException("No design for "+id+": "+failures);
        }
        if(!failures.isEmpty())Files.writeString(out.resolve("search-failures.json"),TrackQuality.INSTANCE.json(failures));
    }
}
