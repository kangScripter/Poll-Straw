# Load Test Report

**Generated:** 2026-03-01T06:47:23.668Z  
**API URL:** https://apis.pollstraw.com/api  
**VUs:** 50  
**Duration:** 30s (from script)  
**Status:** FAILED

---

## Summary

```
✓ vote status 201 or 400

     checks.........................: 100.00% ✓ 138       ✗ 0   
     data_received..................: 747 kB  22 kB/s
     data_sent......................: 187 kB  5.5 kB/s
     http_req_blocked...............: avg=28.66ms  min=0s       med=0s     max=249.11ms p(90)=227.39ms p(95)=242.87ms
     http_req_connecting............: avg=1.75ms   min=0s       med=0s     max=19.2ms   p(90)=12.2ms   p(95)=15.3ms  
   ✗ http_req_duration..............: avg=3.8s     min=229.76ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
       { expected_response:true }...: avg=3.8s     min=229.76ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
   ✓ http_req_failed................: 0.00%   ✓ 0         ✗ 414 
     http_req_receiving.............: avg=145.73µs min=0s       med=0s     max=3.28ms   p(90)=583.47µs p(95)=906.02µs
     http_req_sending...............: avg=192.03µs min=0s       med=0s     max=1.6ms    p(90)=611.49µs p(95)=788.12µs
     http_req_tls_handshaking.......: avg=4.76ms   min=0s       med=0s     max=50.28ms  p(90)=32.89ms  p(95)=42.44ms 
     http_req_waiting...............: avg=3.8s     min=228.16ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
     http_reqs......................: 414     12.126796/s
     iteration_duration.............: avg=11.99s   min=4.06s    med=10.39s max=25.82s   p(90)=21.8s    p(95)=24.27s  
     iterations.....................: 138     4.042265/s
     vus............................: 3       min=3       max=50
     vus_max........................: 50      min=50      max=50
```

---

## Full k6 output

```

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: C:\Users\Srikanth\Downloads\AppVote\backend\load\votes.k6.js
        output: -

     scenarios: (100.00%) 1 scenario, 50 max VUs, 1m0s max duration (incl. graceful stop):
              * default: 50 looping VUs for 30s (gracefulStop: 30s)


running (0m01.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [   3% ] 50 VUs  01.0s/30s

running (0m02.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [   7% ] 50 VUs  02.0s/30s

running (0m03.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [  10% ] 50 VUs  03.0s/30s

running (0m04.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [  13% ] 50 VUs  04.0s/30s

running (0m05.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [  17% ] 50 VUs  05.0s/30s

running (0m06.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [  20% ] 50 VUs  06.0s/30s

running (0m07.0s), 50/50 VUs, 0 complete and 0 interrupted iterations
default   [  23% ] 50 VUs  07.0s/30s

running (0m08.0s), 50/50 VUs, 4 complete and 0 interrupted iterations
default   [  27% ] 50 VUs  08.0s/30s

running (0m09.0s), 50/50 VUs, 6 complete and 0 interrupted iterations
default   [  30% ] 50 VUs  09.0s/30s

running (0m10.0s), 50/50 VUs, 9 complete and 0 interrupted iterations
default   [  33% ] 50 VUs  10.0s/30s

running (0m11.0s), 50/50 VUs, 11 complete and 0 interrupted iterations
default   [  37% ] 50 VUs  11.0s/30s

running (0m12.0s), 50/50 VUs, 13 complete and 0 interrupted iterations
default   [  40% ] 50 VUs  12.0s/30s

running (0m13.0s), 50/50 VUs, 14 complete and 0 interrupted iterations
default   [  43% ] 50 VUs  13.0s/30s

running (0m14.0s), 50/50 VUs, 15 complete and 0 interrupted iterations
default   [  47% ] 50 VUs  14.0s/30s

running (0m15.0s), 50/50 VUs, 17 complete and 0 interrupted iterations
default   [  50% ] 50 VUs  15.0s/30s

running (0m16.0s), 50/50 VUs, 20 complete and 0 interrupted iterations
default   [  53% ] 50 VUs  16.0s/30s

running (0m17.0s), 50/50 VUs, 24 complete and 0 interrupted iterations
default   [  57% ] 50 VUs  17.0s/30s

running (0m18.0s), 50/50 VUs, 34 complete and 0 interrupted iterations
default   [  60% ] 50 VUs  18.0s/30s

running (0m19.0s), 50/50 VUs, 39 complete and 0 interrupted iterations
default   [  63% ] 50 VUs  19.0s/30s

running (0m20.0s), 50/50 VUs, 41 complete and 0 interrupted iterations
default   [  67% ] 50 VUs  20.0s/30s

running (0m21.0s), 50/50 VUs, 46 complete and 0 interrupted iterations
default   [  70% ] 50 VUs  21.0s/30s

running (0m22.0s), 50/50 VUs, 47 complete and 0 interrupted iterations
default   [  73% ] 50 VUs  22.0s/30s

running (0m23.0s), 50/50 VUs, 51 complete and 0 interrupted iterations
default   [  77% ] 50 VUs  23.0s/30s

running (0m24.0s), 50/50 VUs, 53 complete and 0 interrupted iterations
default   [  80% ] 50 VUs  24.0s/30s

running (0m25.0s), 50/50 VUs, 60 complete and 0 interrupted iterations
default   [  83% ] 50 VUs  25.0s/30s

running (0m26.0s), 50/50 VUs, 65 complete and 0 interrupted iterations
default   [  87% ] 50 VUs  26.0s/30s

running (0m27.0s), 50/50 VUs, 68 complete and 0 interrupted iterations
default   [  90% ] 50 VUs  27.0s/30s

running (0m28.0s), 50/50 VUs, 70 complete and 0 interrupted iterations
default   [  93% ] 50 VUs  28.0s/30s

running (0m29.0s), 50/50 VUs, 78 complete and 0 interrupted iterations
default   [  97% ] 50 VUs  29.0s/30s

running (0m30.0s), 50/50 VUs, 88 complete and 0 interrupted iterations
default   [ 100% ] 50 VUs  30.0s/30s

running (0m31.0s), 45/50 VUs, 93 complete and 0 interrupted iterations
default ↓ [ 100% ] 50 VUs  30s

running (0m32.0s), 41/50 VUs, 97 complete and 0 interrupted iterations
default ↓ [ 100% ] 50 VUs  30s

running (0m33.0s), 38/50 VUs, 100 complete and 0 interrupted iterations
default ↓ [ 100% ] 50 VUs  30s

running (0m34.0s), 03/50 VUs, 135 complete and 0 interrupted iterations
default ↓ [ 100% ] 50 VUs  30s
     ✓ vote status 201 or 400

     checks.........................: 100.00% ✓ 138       ✗ 0   
     data_received..................: 747 kB  22 kB/s
     data_sent......................: 187 kB  5.5 kB/s
     http_req_blocked...............: avg=28.66ms  min=0s       med=0s     max=249.11ms p(90)=227.39ms p(95)=242.87ms
     http_req_connecting............: avg=1.75ms   min=0s       med=0s     max=19.2ms   p(90)=12.2ms   p(95)=15.3ms  
   ✗ http_req_duration..............: avg=3.8s     min=229.76ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
       { expected_response:true }...: avg=3.8s     min=229.76ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
   ✓ http_req_failed................: 0.00%   ✓ 0         ✗ 414 
     http_req_receiving.............: avg=145.73µs min=0s       med=0s     max=3.28ms   p(90)=583.47µs p(95)=906.02µs
     http_req_sending...............: avg=192.03µs min=0s       med=0s     max=1.6ms    p(90)=611.49µs p(95)=788.12µs
     http_req_tls_handshaking.......: avg=4.76ms   min=0s       med=0s     max=50.28ms  p(90)=32.89ms  p(95)=42.44ms 
     http_req_waiting...............: avg=3.8s     min=228.16ms med=3.46s  max=17.12s   p(90)=6.86s    p(95)=11.89s  
     http_reqs......................: 414     12.126796/s
     iteration_duration.............: avg=11.99s   min=4.06s    med=10.39s max=25.82s   p(90)=21.8s    p(95)=24.27s  
     iterations.....................: 138     4.042265/s
     vus............................: 3       min=3       max=50
     vus_max........................: 50      min=50      max=50
running (0m34.1s), 00/50 VUs, 138 complete and 0 interrupted iterations
default ✓ [ 100% ] 50 VUs  30s

time="2026-03-01T12:17:23+05:30" level=error msg="thresholds on metrics 'http_req_duration' have been crossed"

```

---

*Run with: `npm run load-test` (ensure API server is running, e.g. `npm run dev`).*
