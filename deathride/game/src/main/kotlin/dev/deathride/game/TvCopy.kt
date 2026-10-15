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
