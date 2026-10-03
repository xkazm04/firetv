package dev.deathride.core;
import java.nio.file.*;
import java.util.*;

/** Post-acceptance diagnostic. Never edits core, race limits, or accepted outcomes. */
public final class CampaignTimeoutWitness {
  public static void main(String[] args) throws Exception {
    Path directory=Path.of(args[0]);
    List<CampaignOutcome> library=Files.readAllLines(directory.resolve("physical.csv")).stream().skip(1).map(CampaignOutcome.Companion::parse).toList();
    CampaignOutcome witness=Files.readAllLines(directory.resolve("boss-extra.csv")).stream().skip(1).map(CampaignOutcome.Companion::parse).filter(r->!r.getFinished()&&r.getHp()>0).findFirst().orElseThrow();
    Profile canonical=new Profile("campaign-reference",true);
    for(int round=0;round<=witness.getRound();round++) {
      canonical.setCareerRound$core(round);canonical.setCareerCleared$core(round);
      CareerSpending.INSTANCE.spend(canonical,8);RivalEconomy.INSTANCE.prepare(canonical,round);
      if(round==witness.getRound()) {
        Profile lead=new Profile("physical-lead",false);lead.setCredits$core(8000);lead.setCareerCleared$core(round);lead.setSelectedCar(witness.getCar());Arrays.fill(lead.getOwned(),false);lead.getOwned()[witness.getCar()]=true;
        CareerSpending.INSTANCE.upgrade(lead,witness.getBand());
        Course course=Courses.INSTANCE.getAll().get(Career.INSTANCE.getEvents().get(round).getCourseIndex());
        World w=new World(witness.getSeed(),new CarSpec(),new Track(120,40,12,Surfaces.INSTANCE.getAsphalt(),course),new SlipHandling(),true,true);
        RivalEconomy.INSTANCE.apply(canonical.copy(),w,1,round,false);Garage.INSTANCE.apply(lead,w.getCars()[0],lead.getSelectedCar());w.getCars()[0].setAiSkill(AiSkills.INSTANCE.getAll().stream().filter(s->s.getId().equals("Rookie")).findFirst().orElseThrow());w.reset();
        InputFrame[] frames=new InputFrame[6];Arrays.setAll(frames,i->new InputFrame());
        while(w.getCars()[0].getFinishSeconds()<0&&!w.getCombat().wrecked(0)&&w.getSeconds()<w.getRaceLimitSeconds())w.step(frames,1.0/60);
        if(w.stateHash()!=witness.getHash())throw new AssertionError("Witness differs: "+w.stateHash()+" != "+witness.getHash());
        System.out.println("Exact accepted watchdog hash reproduced. The accepted outcome remains unresolved.");
        Car stopped=w.getCars()[0];
        Arrays.stream(w.getObstacles().getAll()).sorted(Comparator.comparingDouble(o->Math.hypot(o.getX()-stopped.getX(),o.getY()-stopped.getY()))).limit(3).forEach(o->System.out.println("Nearest obstacle: "+o.getDefinition().getId()+" / "+o.getDefinition().getEffect()+"; centre distance "+Math.hypot(o.getX()-stopped.getX(),o.getY()-stopped.getY())+" m; radius "+o.getRadius()+" m"));
        for(Car other:w.getCars())if(other.getId()!=0)System.out.println("Other car "+other.getId()+"; distance "+Math.hypot(other.getX()-stopped.getX(),other.getY()-stopped.getY())+" m; finished "+other.getFinishSeconds());
        System.out.println("seconds,laps,nextGate,progressM,x,y,speedMps,aiMode,aiReason,health,finishSeconds,hash");
        emit(w);double next=w.getSeconds()+30;
        while(w.getCars()[0].getFinishSeconds()<0&&!w.getCombat().wrecked(0)&&w.getSeconds()<1020) {
          w.step(frames,1.0/60);
          if(w.getSeconds()>=next){emit(w);next+=30;}
        }
        emit(w);break;
      }
      final int event=round;
      double rating=PowerRating.INSTANCE.of(CarCatalog.INSTANCE.getAll().get(canonical.getSelectedCar()),canonical.bonuses(canonical.getSelectedCar()));
      CampaignOutcome ref=library.stream().filter(r->r.getRound()==event&&r.getSkill()==1&&r.getCar()==canonical.getSelectedCar()).min(Comparator.comparingDouble(r->Math.abs(r.getPlayerPR()-rating))).orElseThrow();
      long ticket=Economy.INSTANCE.start(canonical);RivalEconomy.INSTANCE.settleResults(canonical,ticket,round,ref.getRivals());
      Career.INSTANCE.settle(canonical,ticket,round,1,ref.getPosition(),ref.getKills(),ref.getHp(),ref.getQualified(),ref.getCash(),false,ref.getClean(),ref.getFinished(),ref.bossPosition());
    }
  }
  private static void emit(World w) {
    Car c=w.getCars()[0];System.out.println(w.getSeconds()+","+c.getLap().getLaps()+","+c.getLap().getNextGate()+","+c.getLap().getProgressM()+","+c.getX()+","+c.getY()+","+c.getSpeedMps()+","+c.getAiMode()+","+c.getAiReason()+","+w.getCombat().health(0)+","+c.getFinishSeconds()+","+w.stateHash());
  }
}
