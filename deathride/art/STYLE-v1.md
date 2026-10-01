# Death Ride art contract

The exact `style_block` in `style.json` is compiled verbatim at the start of every image prompt, including edits. The action block owns the subject and its state. There is no short-form style prompt.

The owner's 2026-10-01 test art establishes the inked, cel-painted mechanical direction. Reference files remain in the read-only source folder; `references.json` records their hashes, roles and limitations. They are not evidence that all source sprites meet production gates. The angled Trail and scene demonstrate finish only; Bastion demonstrates armor language despite clipping. Text on Comet and gradients/shadows on backgrounds are defects to exclude.

Cars: orthographic overhead, front toward screen +x, neutral diffuse light, no cast shadow. Hood, roof, wheels and windshield must explain heading without numbers or logos. Outline scales down to approximately one physical pixel at the smallest intended view. Each class keeps its accent on body panels; rubber, glass, metal and outline keep shared roles.

Scale comes from `core/src/main/resources/data/car-shapes.csv`, with camera density from `presentation.csv`. W6's final addendum governs: retain enlarged cars and camera. The pipeline's `pixels_per_metre` is texture authoring density, not camera zoom. Crop/normalize preserves the measured silhouette aspect; an out-of-band aspect fails rather than being stretched into compliance. An art-derived body-bounds centre maps to the simulation body centre. Damage variants inherit the reference coordinate system, never a newly trimmed origin.

Tile surfaces occupy their whole image and wrap on both axes. They receive separate repeat-addressed pages, not sprite-atlas gutters. Kerb stripes are intentional repetition; anonymous surface materials are checked for conspicuous motifs. Isolated sprites use a magenta key, despilled RGB, transparent margins and extruded colour under transparent pixels. Atlas sampling is bilinear without mipmaps; runtime integration must preserve this contract or rebuild gutters.

Machine gates can reject or route to review. They cannot certify taste. Owner reference approval, on-Stick appearance and the final quality verdict remain separate recorded states.
