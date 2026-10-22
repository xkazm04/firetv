# Security policy: firetv

## Reporting a vulnerability

Report it privately through GitHub's private vulnerability reporting: the repository's **Security** tab, then
**Report a vulnerability** (<https://github.com/xkazm04/firetv/security/advisories/new>). Please do not open a public
issue or pull request for a vulnerability.

One owner maintains this repository, so the times below are what one person can keep:

- **Acknowledgement within 7 days** of the report.
- **An assessment within 30 days**: whether it is accepted, how severe it is, and a fix plan or the reason for
  declining.
- A fix lands as a normal pull request after that. The advisory is published once a fixed build exists, with credit if
  you want it.

The reporting form has to be switched on by the owner under Settings → Code security → Private vulnerability reporting.
If the link above shows no form, that switch is off. Open an issue that asks for a private contact and contains no
detail of the vulnerability.

## Scope

In scope:

- **Telestrator TV app** (`tv-app/`, `core/`):
  - the embedded Ktor server that listens on the LAN;
  - QR pairing and the relay transport;
  - the companion page it serves (`companion/`).
- **Study Desk** (`desk/`):
  - how `src/proxy.ts` classifies TV, phone and guest callers;
  - pairing (`src/lib/session/pairing.ts`);
  - anything that could expose a learner's records or an engine key.
- The CI workflows in `.github/workflows/`, which build and attest artifacts.

Out of scope:

- The desk is a functional prototype meant for a home LAN. Hardening it for the open internet is not a vulnerability
  report, but a way to reach it from outside the LAN is.
- `vision/` and `prototype/` are local tools and static design pages.

## Automated guardrails we run

- [x] Dependency scanning: Dependabot version and security updates for every manifest (`.github/dependabot.yml`). They
  cover the Gradle builds, the npm projects and the GitHub Actions. The resolved Gradle graph is not submitted:
  GitHub's dependency graph is switched off for this repository (the note in `.github/workflows/supply-chain.yml`),
  and turning it on is the owner's call.
- [x] Signed, attested build artifacts: the TV APK's build provenance is attested in
  `.github/workflows/supply-chain.yml`. Its CycloneDX SBOM is attested against the same APK in
  `.github/workflows/sbom.yml`. CONTRIBUTING.md, "Verifying a TV APK", shows both checks.
- [x] Committed secrets: the `secrets.neverCommit` patterns in `.ai/guardrails.yaml` are a hard fail of the doctor on
  every pull request (`.github/workflows/conformance-gate.yml`, which judges the doctor through
  `scripts/doctor-gate.mjs`). Keys come only from the environment.
- [ ] SAST (CodeQL or Semgrep) on every pull request: not yet.
- [ ] Secret scanning of history in CI (gitleaks or similar): not yet. The local pre-push hook is the owner's call
  (`.ai/memory/0011-lint-and-prepush-hook-operator-gated.md`).
- [ ] Every Action reference pinned to a commit SHA: not yet. `node scripts/pin-actions.mjs` pins them and needs
  network and a GitHub token (`.ai/memory/0013-pin-actions-with-the-script.md`).
- Container image scanning: not applicable, because nothing here ships as an image.

## Notes

`node tools/security-policy-test.cjs` holds this file to its word, in `.github/workflows/harness-drills.yml`. It fails
in any of these cases:

- the file still carries a template placeholder;
- the reporting section names no private channel or response time;
- a ticked guardrail cites a file that does not exist;
- a ticked guardrail is not actually run: an SBOM with no `attest-sbom`, provenance with no `attest-build-provenance`,
  SAST with no CodeQL or Semgrep step, pinning with a ref that still floats.
- a ticked guardrail is only described in a workflow comment, or claims "every pull request" while the workflow it
  cites does not run on pull requests;
- the never-commit patterns miss a secret file AGENTS.md names (`desk/.env.local`, a keystore), checked by running
  the doctor on a scratch index that tracks them.
