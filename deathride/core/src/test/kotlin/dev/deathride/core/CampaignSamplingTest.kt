package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignSamplingTest {
    @Test fun streamingSupplementRejectsPartialDuplicateAndMalformedInput() {
        val row="0,0,0,0,91,318,355,1,0,80,0,true,true,true,false,100,123,0:1:0:80:0:true:true:false"
        val other=row.replace(",91,",",92,")
        assertNull(campaignCompleteEvent("header\n$row",0,1),"unterminated writer buffer is not a sample")
        assertNull(campaignCompleteEvent("header\n$row\n",0,2),"partial event is not a full cell cross")
        assertNull(campaignCompleteEvent("header\n$row\n",1,1))
        assertEquals(listOf(row,other),campaignCompleteEvent("header\n$row\n$other\n",0,2))
        assertThrows(IllegalStateException::class.java){campaignCompleteEvent("header\n$row\n$row\n",0,2)}
        assertThrows(IllegalStateException::class.java){campaignCompleteEvent("header\n$row\n$other\n",0,1)}
        assertThrows(IllegalStateException::class.java){campaignCompleteEvent("header\n0,incomplete\n",0,1)}
    }
}
