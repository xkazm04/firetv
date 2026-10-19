package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

/** Player-facing copy budget for the phone and TV menus: a picture and one short line, not a paragraph. */
class CopyBudgetTest {
    private fun column(table: String,name: String,limit: Int) {
        val over=Content.table(table).filter{it.getValue(name).length>limit}.map{"${it.values.first()}: ${it.getValue(name).length}"}
        assertTrue(over.isEmpty()) { "$table.$name over $limit chars: $over" }
    }
    @Test fun tableDescriptionsFitOneLine() {
        column("parts","description",34);column("consumables","description",34);column("contracts","description",34)
        column("contracts","name",24);column("consumables","name",24);column("parts","name",24)
        column("difficulties","description",34);column("controller-layouts","description",48)
        column("campaign-mechanic","tutorial",60);column("campaign-mechanic","line",64)
    }
    @Test fun runtimeMessagesFitOneLine() {
        val limit=48
        val texts=ArrayList<String>()
        for(round in Career.events.indices)texts+=Career.objective(round)
        val p=Profile("copy");p.credits=0
        texts+=Market.transact(p,"trade","Bastion",99);texts+=Market.transact(p,"loan","",0);texts+=Market.transact(p,"repay","",p.marketRevision)
        texts+=Market.transact(p,"item","nothing",p.marketRevision);texts+=Market.transact(p,"contract","nothing",p.marketRevision)
        for(i in Campaign.allies.indices)for(c in listOf("money","car","part"))texts+=Campaign.reason(p,i,c)
        for(i in Parts.all.indices)texts+=Garage.offer(p,i).reason
        val over=texts.filter{it.length>limit}
        assertTrue(over.isEmpty()) { "over $limit chars: $over" }
    }
}
