import dev.deathride.core.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

/** Executes against either frozen runtime; no Gradle output or gameplay mutations. */
public final class OwnerCourseBalance {
    static Profile developed(int car) {
        Profile p=new Profile("owner-class-"+car,false);
        p.setCredits$core(8000);p.setCareerCleared$core(34);p.setSelectedCar(car);
        Arrays.fill(p.getOwned(),false);p.getOwned()[car]=true;
        CareerSpending.INSTANCE.upgrade(p,17);
        return p;
    }
    static World make(CareerEvent event,int seed,int rotation,boolean upgrade) {
        Course c=Courses.INSTANCE.getAll().get(event.getCourseIndex());
        World w=TrackQualitySimulationKt.qualityWorld(c,seed,rotation,false,event.getPlayerTier(),event.getLaps(),true);
        if(upgrade)for(Car car:w.getCars()) {
            int index=CarCatalog.INSTANCE.getAll().indexOf(car.getCarClass());
            Garage.INSTANCE.apply(developed(index),car,index);
        }
        Encounters.INSTANCE.apply(w,Career.INSTANCE.getCups().get(event.getCupIndex()).getId());
        w.reset();return w;
    }
    static void run(World w) {
        InputFrame[] frames=new InputFrame[6];Arrays.setAll(frames,i->new InputFrame());
        while(w.getResolved()<w.getEntrantCount() && w.getSeconds()<w.getRaceLimitSeconds())w.step(frames,Tuning.STEP_SECONDS);
    }
    public static void main(String[] args)throws Exception {
        Path out=Path.of(args[0]);int seeds=Integer.parseInt(args[1]);
        if(Files.exists(out))throw new IllegalStateException("Refuse to overwrite "+out);
        Files.createDirectories(out.getParent());
        List<CareerEvent> events=Career.INSTANCE.getEvents().stream().filter(e->!e.getElimination()).toList();
        int count=events.size()*2*seeds*6;String[] rows=new String[count];AtomicInteger done=new AtomicInteger();
        IntStream.range(0,count).parallel().forEach(i->{
            int rotation=i%6,n=i/6,sample=n%seeds;n/=seeds;int build=n%2,round=n/2;
            CareerEvent e=events.get(round);int seed=20261004+round*100003+sample*7919;
            World w=make(e,seed,rotation,build==1);run(w);
            if(sample==0&&rotation==0){World replay=make(e,seed,rotation,build==1);run(replay);if(w.stateHash()!=replay.stateHash())throw new IllegalStateException("Replay "+e.getId());}
            Car winner=Arrays.stream(w.getCars()).filter(c->c.getPosition()==1&&c.getFinishSeconds()>=0).findFirst().orElse(null);
            String cars=String.join(";",Arrays.stream(w.getCars()).map(c->c.getId()+":"+c.getCarClass().getId()+":"+c.getFinishSeconds()+":"+c.getFinishKind().name()+":"+w.getCombat().health(c.getId())).toList());
            rows[i]=String.join(",",e.getId(),Courses.INSTANCE.getAll().get(e.getCourseIndex()).getId(),""+e.getPlayerTier(),""+e.getLaps(),build==0?"stock":"developed",""+sample,""+seed,""+rotation,
                winner==null?"unresolved":winner.getCarClass().getId(),winner==null?"-1":""+winner.getId(),winner==null?"-1":""+winner.getFinishSeconds(),""+w.getSeconds(),""+w.getRaceLimitSeconds(),""+(w.getEntrantCount()-w.getResolved()),
                ""+(w.getCombat().wrecked(0)&&w.getCars()[0].getLap().getLaps()==0),""+w.getCombat().getOneShotKills(),""+w.stateHash(),cars);
            int total=done.incrementAndGet();if(total%100==0)System.out.println("Class balance "+total+"/"+count);
        });
        Files.writeString(out,"event,course,tier,laps,build,sample,seed,rotation,winner,winnerSlot,winnerSeconds,seconds,limitSeconds,unresolved,earlyLead,oneShots,hash,cars\n"+String.join("\n",rows)+"\n");
        System.out.println("Class balance complete: "+count);
    }
}
