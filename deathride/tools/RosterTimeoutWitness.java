package dev.deathride.core;
import java.util.*;
/** Diagnostic extension only; leaves the accepted 300-second outcome unchanged. */
public final class RosterTimeoutWitness {
 public static void main(String[] args) {
  Profile[] profiles=new Profile[2];
  for(int i=0;i<2;i++){Profile p=new Profile("roster-witness-"+i,false);p.setCredits$core(8000);p.setCareerCleared$core(34);p.setSelectedCar(i);Arrays.fill(p.getOwned(),false);p.getOwned()[i]=true;CareerSpending.INSTANCE.upgrade(p,17);profiles[i]=p;}
  World w=new World(105254614,new CarSpec(),new Track(700,120,14,Surfaces.INSTANCE.getAsphalt(),null),new SlipHandling(),true,true);
  for(Car c:w.getCars()){Profile p=profiles[c.getId()/3];Garage.INSTANCE.apply(p,c,p.getSelectedCar());c.setAiSkill(Career.INSTANCE.getDifficulties().get(0).getSkill());}
  Encounters.INSTANCE.apply(w,Career.INSTANCE.getCups().get(0).getId());w.reset();
  InputFrame[] inputs=new InputFrame[6];Arrays.setAll(inputs,i->new InputFrame());
  while(w.getResolved()<w.getEntrantCount()&&w.getSeconds()<300)w.step(inputs,1.0/60);
  if(w.stateHash()!=2604451404742352589L)throw new AssertionError("Wrong accepted witness: "+w.stateHash());
  System.out.println("Exact 300-second accepted hash reproduced; unresolved result is retained.");emit(w);
  double next=w.getSeconds()+30;
  while(w.getResolved()<w.getEntrantCount()&&w.getSeconds()<600){w.step(inputs,1.0/60);if(w.getSeconds()>=next){emit(w);next+=30;}}
  emit(w);
 }
 private static void emit(World w){for(Car c:w.getCars())if(c.getId()==3||c.getId()==4)System.out.println("seconds="+w.getSeconds()+", car="+c.getId()+", laps="+c.getLap().getLaps()+", progress="+c.getLap().getProgressM()+", speed="+c.getSpeedMps()+", mode="+c.getAiMode()+", hp="+w.getCombat().health(c.getId())+", finished="+c.getFinishSeconds()+", x="+c.getX()+", y="+c.getY());}
}
