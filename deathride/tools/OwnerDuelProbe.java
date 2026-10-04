import dev.deathride.core.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.IntStream;

/** Real campaign setup, with explicit supply-only experimental courses outside runtime content. */
public final class OwnerDuelProbe {
    public static World make(Course course,int seed,String skill) {
        Profile profile=new Profile("owner-duel-fixture",true);
        profile.setCareerRound$core(34);profile.setCareerCleared$core(34);profile.setCredits$core(8000);
        for(Profile rival:profile.getRivalProfiles())rival.setCredits$core(8000);
        RivalEconomy.INSTANCE.prepare(profile,34);
        Track t=new Track();World w=new World(seed,new CarSpec(),new Track(t.getStraightM(),t.getRadiusM(),t.getHalfWidthM(),t.getSurface(),course),new SlipHandling(),true,true);
        int difficulty=IntStream.range(0,Career.INSTANCE.getDifficulties().size()).filter(i->Career.INSTANCE.getDifficulties().get(i).getSkill().getId().equals(skill)).findFirst().orElseThrow();
        RivalEconomy.INSTANCE.apply(profile,w,difficulty,34,false);
        for(Car car:w.getCars())car.setHuman(false);
        w.getCars()[0].setAiSkill(AiSkills.INSTANCE.getAll().stream().filter(s->s.getId().equals(skill)).findFirst().orElseThrow());
        w.reset();if(w.getEntrantCount()!=2||w.getCars()[1].getAiStyle()!=DeathDuel.INSTANCE.getBoss())throw new IllegalStateException("Not the actual duel");return w;
    }
    public static void main(String[] args)throws Exception {
        Path out=Path.of(args[0]);Files.createDirectories(out);int samples=Integer.parseInt(args[1]);
        List<String> variants=args.length>2?List.of(args[2].split(",")):List.of("original","ammo8","ammo16","ammo24");
        Course original=Courses.INSTANCE.getAll().stream().filter(c->c.getId().equals("crown-7-a")).findFirst().orElseThrow();
        for(String variant:variants) {
            List<TrackSpot> spots=new ArrayList<>(original.getSpots());
            if(variant.startsWith("ammo")) {
                spots.removeIf(s->s.getKind().equals("ammo"));int n=Integer.parseInt(variant.substring(4));
                for(int i=0;i<n;i++)spots.add(new TrackSpot("ammo",(i+.5)/n,0));
            }
            Course course=new Course(original.getId(),original.getName(),original.getLesson(),original.getStartFraction(),original.getTheme(),original.getNodes(),spots,original.getFeatures(),original.getObstaclePlacements(),original.getJunctions(),original.getBranches(),original.getRaceProfile(),original.getRegion());
            if(!Arrays.equals(course.getX(),original.getX())||!Arrays.equals(course.getWidth(),original.getWidth()))throw new IllegalStateException("Layout changed");
            if(!TrackLinter.INSTANCE.errors(course).isEmpty())throw new IllegalArgumentException(TrackLinter.INSTANCE.errors(course).toString());
            String[] rows=new String[samples];
            IntStream.range(0,samples).parallel().forEach(index->{
                int start=args.length>3?Integer.parseInt(args[3]):0;String skill=args.length>4?args[4]:"Pro";int seed=7319+(start+index)*104729;World w=make(course,seed,skill);InputFrame[] frames=new InputFrame[6];Arrays.setAll(frames,i->new InputFrame());
                int unseen=0,waiting=0;double minGap=Double.POSITIVE_INFINITY;
                while(w.getResolved()<w.getEntrantCount()&&w.getSeconds()<w.getRaceLimitSeconds()) {
                    w.step(frames,Tuning.STEP_SECONDS);Car boss=w.getCars()[1],rig=w.getCars()[0];
                    if(boss.getAiDuelTarget()<0)unseen++;if(boss.getAiDuelWait())waiting++;
                    minGap=Math.min(minGap,Math.hypot(boss.getX()-rig.getX(),boss.getY()-rig.getY()));
                }
                StringBuilder cars=new StringBuilder();for(Car c:w.getCars())if(c.getEntered()) {
                    if(!cars.isEmpty())cars.append(';');cars.append(c.getId()).append(':').append(c.getCarClass().getId()).append(':').append(w.getCombat().health(c.getId())).append(':').append(c.getFinishKind().name()).append(':').append(w.getCombat().ammo(c.getId(),0)).append(':').append(w.getCombat().ammo(c.getId(),1)).append(':').append(w.getCombat().getAmmoPickupsTaken()[c.getId()]);
                }
                boolean rigWin=w.getCars()[0].getFinishKind()==FinishKind.ELIMINATION;
                rows[index]=String.join(",",variant,""+seed,""+w.getSeconds(),""+(w.getResolved()<w.getEntrantCount()),""+rigWin,""+w.getCombat().getOneShotKills(),""+w.stateHash(),cars.toString(),""+unseen*Tuning.STEP_SECONDS,""+waiting*Tuning.STEP_SECONDS,""+minGap);
            });
            Path target=out.resolve(variant+".csv");if(Files.exists(target))throw new IllegalStateException("Refuse overwrite");
            Files.writeString(target,"variant,seed,seconds,timeout,rigWin,oneShots,hash,cars,unseenSeconds,waitingSeconds,minGapM\n"+String.join("\n",rows)+"\n");
            System.out.println(variant+" timeouts="+Arrays.stream(rows).filter(s->s.split(",")[3].equals("true")).count()+"/"+samples+" rigWins="+Arrays.stream(rows).filter(s->s.split(",")[4].equals("true")).count());
        }
    }
}
