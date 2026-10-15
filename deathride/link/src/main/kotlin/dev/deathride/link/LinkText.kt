package dev.deathride.link

/** Every sentence the link puts in front of a person (pairing refusals, the TV lobby's link status) and the one-word
 *  screen name the phone shows. Short on purpose: a phone shows one line, the TV reads from 3 m. */
object LinkText {
    /** A refusal: [code] is for the page's logic, [message] is the one line a person reads. */
    class Refusal(val code: String,val message: String)
    const val RACE_ON="RACE_ON"
    const val BAD_PIN="BAD_PIN"
    const val FULL="FULL"
    const val PROFILE_TAKEN="PROFILE_TAKEN"
    /** Why a pairing hello was not given a seat, in the order [RaceServer] checks it. */
    fun refusal(phase: String,pinOk: Boolean,seatFree: Boolean): Refusal = when {
        phase=="race" || phase=="countdown" -> Refusal(RACE_ON,"Race on. Join from the lobby.")
        !pinOk -> Refusal(BAD_PIN,"Wrong TV code. Check the TV.")
        !seatFree -> Refusal(FULL,"Both seats taken. REWIND on the TV resets.")
        else -> Refusal(PROFILE_TAKEN,"That profile is already in.")
    }
    fun refusalJson(r: Refusal)="{\"t\":\"error\",\"code\":\"${r.code}\",\"message\":\"${r.message}\"}"
    const val STARTING="Starting phone link..."
    const val READY="Phone link ready"
    const val LOST="Phone link lost. Reopen the app."
    const val PORT_BUSY="Port busy. Close the other Death Ride, reopen."
    const val NO_WIFI="No Wi-Fi. Connect the TV to your network."
    const val BLOCKED="Phone link unavailable. Close the other Death Ride, reopen."
    /** A command the phone sent that this screen does not take; the phone can say why a button did nothing. */
    fun notNowJson(command: String,phase: String)="{\"t\":\"notNow\",\"for\":\"$command\",\"screen\":\"${screen(phase)}\"}"
    /** The name of the screen the TV is on, one word, for the phone to show instead of deriving it. */
    fun screen(phase: String): String = when(phase) {
        "lobby" -> "LOBBY"; "garage" -> "GARAGE"; "career" -> "CAREER"; "countdown" -> "COUNTDOWN"; "race" -> "RACE"; "results" -> "RESULTS"
        else -> phase.uppercase()
    }
}
