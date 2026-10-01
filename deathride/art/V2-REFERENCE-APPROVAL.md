# Owner approval format for the new car references

Review [the ten exact candidates](review/fusion/index.html) and their 96px silhouettes first. All approvals are currently false. Three identities remain rejected at the three-call ceiling: Comet (margin/aspect), Quill (margin) and Kestrel (margin). Resolve those defects before approving them. Do not approve old v1 identities as substitutes for these fusion sources.

The generation pipeline reads **`deathride/art/reference-approvals.json`**, the `references` object keyed by exact new reference ID. The companion `V2-REFERENCE-APPROVAL.template.json` contains the ten exact candidate hashes and portable original-image paths. Copy approved entries into the canonical ledger, retaining other entries. For each approved source, the owner must supply:

```json
{
  "owner_approved": true,
  "source_sha256": "<exact SHA-256 from this candidate's template entry>",
  "owner_evidence": "<owner decision, date, and reference to the reviewed image>"
}
```

Keep `candidate_source`, `processed_sha256` and style hash evidence from the template. Changing image bytes invalidates approval; every damage/livery brief must point to that exact source file and set `requires_approval` to its reference ID. Missing, false, undocumented or hash-mismatched approval fails before reservation. The style choice is independent of reference approval.

This execution creates **zero of the 40 damage states and zero of the 30 liveries**. The seventy read-only gate checks are in `audits/v2-fusion-derived-gate.json`. This file and the template describe the next approval step; they do not grant it.
