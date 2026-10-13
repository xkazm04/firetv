package dev.telestrator.core

/**
 * The address a phone opens to pair: the page's address with the PIN in the URL fragment.
 *
 * A fragment never leaves the browser, so a relay or proxy serving the page cannot log the PIN from
 * the request line. The page reads the fragment first and still accepts the older `?pin=` query.
 */
object PairingUrl {
    fun of(base: String, pin: String): String = base.substringBefore('#') + "#pin=" + pin

    /** What the card prints under the QR: the address without the scheme, query or PIN. */
    fun display(url: String): String = url.removePrefix("http://").removePrefix("https://").substringBefore('#').substringBefore('?')
}
