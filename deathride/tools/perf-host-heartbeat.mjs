// Independent isolate: distinguishes main-loop stalls from whole-host scheduling gaps.
import {parentPort} from 'node:worker_threads';
let previous=performance.now();
setInterval(()=>{const now=performance.now(),gapMs=now-previous;previous=now;
 if(gapMs>150)parentPort.postMessage({epochMs:performance.timeOrigin+now,gapMs});
},50);
