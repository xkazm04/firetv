package dev.deathride.game

import com.badlogic.gdx.utils.JsonReader
import dev.deathride.core.*

/** Explicit development launch only. Does not alter course resources or campaign/profile state. */
class TrackPreview(val id:String,val course:Course,val tier:Int,val arena:Boolean) {
    // Every preview is a six-car track rehearsal. The campaign finale is a separate two-car duel.
    fun world(seed:Int=7319):World = TrackDraft.world(course,tier,false,seed)
    companion object {
        fun read(text:String):TrackPreview {
            val root=JsonReader().parse(text);val id=root.getString("id");require(id.matches(Regex("[a-z]+-[1-7]-[a-f]")))
            val fields=linkedMapOf<String,String>();var field=root.get("csv").child;while(field!=null){fields[field.name]=field.asString();field=field.next}
            fields["id"]=root.get("course").getString("id");fields["startFraction"]=root.get("course").getDouble("startFraction").toString();fields["previewName"]=id;fields["region"]=Regions.forDivision(id.substringBefore('-')).id
            val tier=root.getInt("tier");val laps=root.getInt("laps");val arena=root.getString("role")=="arena"
            val course=TrackDraft.course(fields);require(TrackLinter.errors(course).isEmpty()){TrackLinter.errors(course).joinToString("; ")}
            val profile=requireNotNull(course.raceProfile)
            require(profile.laps==laps && profile.tier==tier){"Draft metadata and exported race profile disagree"}
            return TrackPreview(id,course,tier,arena)
        }
    }
}
