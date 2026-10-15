package dev.deathride.game

/**
 * Every sentence the TV menus say, as pure strings, so a test can hold them to a word budget and to the phone's vocabulary
 * (deathride/controller/index.html). The TV is read from 3 m: a picture and one short line per screen.
 */
object TvCopy {
    /** The pairing steps under SCAN + GO. Step 3 names no control: the phone's layout decides whether GO is a button. */
    const val LOBBY_STEPS="1  Same Wi-Fi as this TV\n2  Scan with your phone\n3  Drive"
    /** Same word as the phone's footer button. */
    const val START_RACE="START RACE"
    const val NEXT_ROUND="RACE NEXT ROUND"
    const val RACE_AGAIN="RACE AGAIN"
    const val HP="HP"

    /** Remote-key hints, one footer row, always "KEY  ACTION" in capitals like the lobby's row. DOWN races, as the handler does. */
    const val CAREER_HINT_REWARD="L / R  REWARD   DOWN  RACE   PLAY  GARAGE"
    const val CAREER_HINT_DIFFICULTY="L / R  DIFFICULTY   DOWN  RACE   PLAY  GARAGE"

    /** A seat is "PLAYER n" on the phone, the race strip and the results; the footer used to say P1 / P2 / SECOND DRIVER. */
    fun seatLine(seat: Int,car: String,credits: Number): String = "PLAYER ${seat+1} / $car / $credits CR"
    const val JOIN_LINE="PLAYER 2 / SCAN TO JOIN"

    /** Results receipt: what the player kept leads (accent); the arithmetic is the quiet second line, in the phone's words. */
    fun receiptBanked(banked: Number,balance: Number): String = "BANKED +$banked CR / BALANCE $balance CR"
    fun receiptBreakdown(prize: Number,pit: Number,taken: Number): String = "PRIZE $prize / PIT $pit / REPAYMENTS + CAP $taken"

    /** Header hint outside the lobby: where BACK goes. The feel preset is a lobby setting and said nothing in a menu. */
    const val BACK_LOBBY="BACK: LOBBY"
    /** KEY  ACTION like every other hint, so the label names what the key does, never a state it might be in. */
    fun soundHint(muted: Boolean): String = if(muted)"M / Y  SOUND ON" else "M / Y  MUTE"
    /** The garage's focused bar; the phone's button reads "INSTALL n / price CR" (its "n" is a bare tier). */
    fun installLabel(tier: Int,price: Number): String = "INSTALL TIER $tier / $price CR"
    /** The phone's own words for a dead link (controller: "Link lost · coasting"). */
    const val LINK_LOST="LINK LOST"

    const val GARAGE_CAR_HINT="L / R  CAR"
    const val LOBBY_CAREER_HINT="UP  CAREER"

    /** The seat's controller layout that holds GO for the driver (controller-layouts.csv, autoThrottle=1). */
    const val AUTO_LAYOUT="Auto"

    /**
     * What the countdown dial says under its digit. A seat on the Auto layout has no GO button, so "HOLD GO" would
     * contradict its phone; any seat on a pedal layout still needs the instruction.
     */
    fun countdownCue(claimedLayouts: List<String>): String = if(claimedLayouts.any{it!=AUTO_LAYOUT})"HOLD GO" else "GET READY"

    /** Header line beside the screen title: the notice wins; the slogan that used to idle here said nothing the screen did not. */
    fun statusLine(notice: String,sceneReady: Boolean): String = when {
        notice.isNotEmpty() -> notice.uppercase()
        !sceneReady -> "PREPARING CIRCUIT"
        else -> ""
    }

    /** The focused big button on the lobby, results and career screens: the verb the player's phone also shows. */
    fun mainButton(phase: String,campaign: Boolean,rewardPending: Boolean=false): String = when(phase) {
        "lobby" -> START_RACE
        "results" -> if(campaign)NEXT_ROUND else RACE_AGAIN
        "career" -> if(rewardPending)"CLAIM REWARD" else NEXT_ROUND
        else -> ""
    }
}
