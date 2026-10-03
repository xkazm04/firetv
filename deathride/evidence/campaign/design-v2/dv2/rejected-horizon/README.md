# Rejected instrument setup: synthetic-course watchdog

The initial roster job mistakenly used the playable-course 180-second watchdog on the synthetic 2,154 m straight probe. Three laps alone take at least 230.8 seconds at stock Needle top speed, even before braking or launch. This was found by inspecting the instrument while the job ran. The job was stopped before publishing its in-memory rows; the log's indices are worker start indices, not completed-race counts. **No 60,120-race result exists or is claimed for this aborted job.** Its copied probe adapter remains in the ignored runtime snapshot for reproduction.

The corrected driver uses the existing canonical 300-second roster horizon, adds a lower-bound preflight and a test showing 180 fails while 300 passes. No game timer is changed. Complete-outcome and diversity checks still apply after simulation. This is an instrument defect, not a car-balance finding.

To bound duplicate computation, the corrected before control uses 32 seed blocks × six grid shifts per course/build, across all tiers (5,760 paired races). After acceptance uses 334 blocks (60,120 races; 2,004 per course/build). Compare the shared 32-block prefix exactly; the extra after rows are not called paired observations.
