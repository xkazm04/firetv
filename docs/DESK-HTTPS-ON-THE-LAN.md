# Desk over https on the LAN

A phone browser gives no camera and no microphone on a plain `http://` address. With `DESK_HTTPS=1` the desk hands out an `https://` phone link, and the phone has to trust the desk's certificate once.

## Start it

```
cd desk
npm run dev:https
```

To make only the certificate files and stop: `npm run dev:https -- --cert-only`.

The launcher needs `openssl` (Git for Windows ships one) or `mkcert`. It starts `next dev --experimental-https` with `DESK_HTTPS=1`, so the phone link on the TV reads `https://<LAN address>:3000/phone`.

## Where the certificate lands

`desk/certificates/desk-<ip>.pem` (certificate) and `desk/certificates/desk-<ip>-key.pem` (private key). The folder is git-ignored; never commit either file. The certificate is valid for 365 days and is remade if the LAN address changes (the file name carries the address, so a new address means a new pair).

## Trust it once on a family phone

**Path 1: accept the browser warning on first open.** Open the phone link from the TV.
- Android Chrome: "Your connection is not private" → Advanced → Proceed to `<ip>` (unsafe).
- iOS Safari: "This Connection Is Not Private" → Show Details → visit this website → Visit Website.

**Path 2: install the certificate.** Send `desk-<ip>.pem` to the phone (never the `-key.pem`) and install it, or, if you used mkcert, install the mkcert root CA (`mkcert -CAROOT` shows its folder, file `rootCA.pem`).
- Android: Settings → Security → Encryption & credentials → Install a certificate → CA certificate.
- iOS: open the file, Settings → Profile Downloaded → Install, then Settings → General → About → Certificate Trust Settings → switch it on.

## Not verified

UNVERIFIED on a real phone: whether Path 1 (accepting the warning) turns on the camera and the microphone in a given phone browser. Some browsers treat a warned page as not secure and still withhold them. If so, use Path 2. Neither path has been run on a real phone yet.
