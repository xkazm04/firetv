package dev.studydesk.stick

/**
 * The remote's buttons as the desk page reads them. desk/src/tv/keys.ts `keyOf` maps a KeyboardEvent's `key`:
 * ArrowUp..ArrowRight, Enter, Backspace/Escape (Back), ContextMenu (Menu), MediaPlayPause. The stick pass
 * (TV-led design, "Stick pass 2026-10-20") drove the page with these same names; Back went as Backspace.
 *
 * Android key codes are plain ints here (android.view.KeyEvent's values) so the table runs on the JVM.
 */
data class PageKey(val key: String, val keyCode: Int)

object KeyBridge {
    const val DPAD_UP = 19
    const val DPAD_DOWN = 20
    const val DPAD_LEFT = 21
    const val DPAD_RIGHT = 22
    const val DPAD_CENTER = 23
    const val BACK = 4
    const val ENTER = 66
    const val MENU = 82
    const val MEDIA_PLAY_PAUSE = 85
    const val MEDIA_PLAY = 126
    const val MEDIA_PAUSE = 127
    const val NUMPAD_ENTER = 160

    /** How long Back is held before it leaves the app whatever the page does. */
    const val BACK_HOLD_MS = 800L

    private val TABLE = mapOf(
        DPAD_UP to PageKey("ArrowUp", 38),
        DPAD_DOWN to PageKey("ArrowDown", 40),
        DPAD_LEFT to PageKey("ArrowLeft", 37),
        DPAD_RIGHT to PageKey("ArrowRight", 39),
        DPAD_CENTER to PageKey("Enter", 13),
        ENTER to PageKey("Enter", 13),
        NUMPAD_ENTER to PageKey("Enter", 13),
        BACK to PageKey("Backspace", 8),
        MENU to PageKey("ContextMenu", 93),
        MEDIA_PLAY_PAUSE to PageKey("MediaPlayPause", 179),
        MEDIA_PLAY to PageKey("MediaPlayPause", 179),
        MEDIA_PAUSE to PageKey("MediaPlayPause", 179),
    )

    fun pageKeyOf(androidKeyCode: Int): PageKey? = TABLE[androidKeyCode]

    /**
     * The desk's /tv page is also the operator's bench: its button bar hides only under `:fullscreen`
     * (desk/src/app/globals.css), and a WebView has no fullscreen without a user gesture. The stick shows the stage alone.
     */
    const val STAGE_ONLY = "(function(){if(document.getElementById('stick-stage-only'))return;" +
        "var s=document.createElement('style');s.id='stick-stage-only';" +
        "s.textContent='.bench > .bar{display:none !important}';document.head.appendChild(s);" +
        "var a=document.activeElement;if(a&&a.blur&&a!==document.body)a.blur();})()"

    /**
     * A keydown then a keyup on the focused element (the page listens on window, so it bubbles there), or on the stage
     * when nothing on it has focus: LingaTV ignores a key whose target is in the bench's `.bar`. The script's value is
     * whether the page took the keydown: keys.ts and LingaTV call preventDefault on every key they map.
     */
    fun script(k: PageKey): String {
        val init = "{key:'${k.key}',code:'',keyCode:${k.keyCode},which:${k.keyCode},bubbles:true,cancelable:true}"
        return "(function(){var a=document.activeElement;" +
            "var t=(a&&a!==document.body&&!(a.closest&&a.closest('.bar')))?a:(document.querySelector('.stage')||document.body||document.documentElement);" +
            "var o=$init;var d=new KeyboardEvent('keydown',o);" +
            "try{Object.defineProperty(d,'keyCode',{get:function(){return o.keyCode}});" +
            "Object.defineProperty(d,'which',{get:function(){return o.keyCode}});}catch(e){}" +
            "var taken=!t.dispatchEvent(d);t.dispatchEvent(new KeyboardEvent('keyup',o));return taken;})()"
    }
}
