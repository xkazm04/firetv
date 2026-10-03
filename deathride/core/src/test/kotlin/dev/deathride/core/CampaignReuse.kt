package dev.deathride.core

import java.io.File

/** Restricted reuse for a future curve edit and Marrow's previously inactive shop ceiling. */
internal fun campaignReuseDataErrors(before: Map<String,String>,after: Map<String,String>,rounds: Int): List<String> = buildList {
    if(rounds !in 1..28){add("Reuse would include active Marrow");return@buildList}
    if(before.keys!=after.keys){add("Resource set changed");return@buildList}
    for((name,old) in before) {
        val current=after.getValue(name)
        if(name=="career-curve.csv") {
            if(old.lines().take(rounds+1)!=current.lines().take(rounds+1))add("Reused curve prefix changed")
        } else if(name=="rival-garages.csv") {
            val a=old.trim().lines().map{it.split(',')};val b=current.trim().lines().map{it.split(',').toMutableList()}
            if(a.size!=b.size || a.first()!=b.first()){add("Rival schema changed");continue}
            val column=a.first().indexOf("championPrLimit")
            if(column<0){add("Missing rival ceiling");continue}
            for(i in 1 until a.size) {
                if(a[i].first()=="marrow" && b[i].first()=="marrow" && a[i].size==b[i].size) {
                    if((b[i][column].toDoubleOrNull()?:-1.0)<=0)add("Invalid Marrow ceiling")
                    b[i][column]=a[i][column]
                }
                if(a[i]!=b[i])add("Active rival data changed")
            }
        } else if(old!=current)add("Physical resource changed: $name")
    }
}

internal fun campaignValidateReuse(snapshot: File,rounds: Int) {
    val oldClasses=File(snapshot,"4")
    val currentClasses=File(World::class.java.protectionDomain.codeSource.location.toURI())
    fun files(root: File)=root.walkTopDown().filter{it.isFile}.associateBy{it.relativeTo(root).invariantSeparatorsPath}
    val a=files(oldClasses);val b=files(currentClasses)
    check(a.keys==b.keys && a.all{(name,file)->file.readBytes().contentEquals(b.getValue(name).readBytes())}){"Main runtime changed; cannot reuse physical outcomes"}
    val oldData=File(snapshot,"5/data")
    val currentData=File(Content::class.java.getResource("/data/career-curve.csv")!!.toURI()).parentFile
    fun data(root: File)=files(root).mapValues{it.value.readText().replace("\r\n","\n")}
    check(campaignReuseDataErrors(data(oldData),data(currentData),rounds).isEmpty()){"Simulation inputs changed in the reused prefix"}
    check((0 until rounds).all{r->RivalEconomy.cast(r).none{Career.rivals[it].id=="marrow"}})
}
