package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignDesignInstrumentTest {
    @Test fun longSyntheticRosterCoursesRejectThePlayableRaceWatchdog() {
        assertFalse(CampaignDesignInstrument.rosterHorizonValid(TrackRules["maxRaceSeconds"]))
        assertTrue(CampaignDesignInstrument.rosterHorizonValid(RosterRules["probeMaxSeconds"]))
        assertFalse(CampaignDesignInstrument.rosterHorizonValid(0.0))
    }
}
