root@5018543-bi97187:~# echo "=== PM2 ПРОЦЕССЫ ==="
pm2 status
pm2 info mapmon
pm2 info mapmon-api
pm2 info mqtt-collector
=== PM2 ПРОЦЕССЫ ===
┌────┬───────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name              │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ mapmon            │ default     │ 0.7.0   │ cluster │ 16520    │ 3h     │ 1    │ online    │ 0%       │ 80.1mb   │ root     │ disabled │
│ 1  │ mapmon-api        │ default     │ 0.7.0   │ cluster │ 16521    │ 3h     │ 1    │ online    │ 0%       │ 67.5mb   │ root     │ disabled │
│ 2  │ mqtt-collector    │ default     │ 0.7.0   │ cluster │ 16534    │ 3h     │ 1    │ online    │ 0%       │ 71.3mb   │ root     │ disabled │
└────┴───────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
 Describing process with id 0 - name mapmon
┌───────────────────┬────────────────────────────────────────────┐
│ status            │ online                                     │
│ name              │ mapmon                                     │
│ namespace         │ default                                    │
│ version           │ 0.7.0                                      │
│ restarts          │ 1                                          │
│ uptime            │ 3h                                         │
│ entire log path   │ /var/www/mapmon/logs/mapmon-combined-0.log │
│ script path       │ /var/www/mapmon/.output/server/index.mjs   │
│ script args       │ N/A                                        │
│ error log path    │ /var/www/mapmon/logs/mapmon-error-0.log    │
│ out log path      │ /var/www/mapmon/logs/mapmon-out-0.log      │
│ pid path          │ /root/.pm2/pids/mapmon-0.pid               │
│ interpreter       │ /usr/bin/node                              │
│ interpreter args  │ N/A                                        │
│ script id         │ 0                                          │
│ exec cwd          │ /var/www/mapmon                            │
│ exec mode         │ cluster_mode                               │
│ node.js version   │ 20.19.2                                    │
│ node env          │ production                                 │
│ watch & reload    │ ✘                                          │
│ unstable restarts │ 0                                          │
│ created at        │ 2025-07-11T11:45:15.796Z                   │
└───────────────────┴────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 20.63 MiB │
│ Heap Usage             │ 71.84 %   │
│ Heap Size              │ 28.71 MiB │
│ Event Loop Latency p95 │ 1.26 ms   │
│ Event Loop Latency     │ 0.41 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon [--lines 1000]` to display logs
 Use `pm2 env 0` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon
 Describing process with id 1 - name mapmon-api
┌───────────────────┬──────────────────────────────────────────────┐
│ status            │ online                                       │
│ name              │ mapmon-api                                   │
│ namespace         │ default                                      │
│ version           │ 0.7.0                                        │
│ restarts          │ 1                                            │
│ uptime            │ 3h                                           │
│ entire log path   │ /var/www/mapmon/logs/api-combined-1.log      │
│ script path       │ /var/www/mapmon/server-backup/api-server.cjs │
│ script args       │ N/A                                          │
│ error log path    │ /var/www/mapmon/logs/api-error-1.log         │
│ out log path      │ /var/www/mapmon/logs/api-out-1.log           │
│ pid path          │ /root/.pm2/pids/mapmon-api-1.pid             │
│ interpreter       │ /usr/bin/node                                │
│ interpreter args  │ N/A                                          │
│ script id         │ 1                                            │
│ exec cwd          │ /var/www/mapmon                              │
│ exec mode         │ cluster_mode                                 │
│ node.js version   │ 20.19.2                                      │
│ node env          │ production                                   │
│ watch & reload    │ ✘                                            │
│ unstable restarts │ 0                                            │
│ created at        │ 2025-07-11T11:45:15.801Z                     │
└───────────────────┴──────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon-api <action_name>

 Code metrics value
┌────────────────────────┬──────────────┐
│ Used Heap Size         │ 13.66 MiB    │
│ Heap Usage             │ 74.94 %      │
│ Heap Size              │ 18.22 MiB    │
│ Event Loop Latency p95 │ 1.18 ms      │
│ Event Loop Latency     │ 0.39 ms      │
│ Active handles         │ 1            │
│ Active requests        │ 0            │
│ HTTP                   │ 0.16 req/min │
│ HTTP P95 Latency       │ 3 ms         │
│ HTTP Mean Latency      │ 1 ms         │
└────────────────────────┴──────────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon-api [--lines 1000]` to display logs
 Use `pm2 env 1` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon-api
 Describing process with id 2 - name mqtt-collector
┌───────────────────┬──────────────────────────────────────────────────┐
│ status            │ online                                           │
│ name              │ mqtt-collector                                   │
│ namespace         │ default                                          │
│ version           │ 0.7.0                                            │
│ restarts          │ 1                                                │
│ uptime            │ 3h                                               │
│ entire log path   │ /var/www/mapmon/logs/mqtt-combined-2.log         │
│ script path       │ /var/www/mapmon/server-backup/mqtt-collector.cjs │
│ script args       │ N/A                                              │
│ error log path    │ /var/www/mapmon/logs/mqtt-error-2.log            │
│ out log path      │ /var/www/mapmon/logs/mqtt-out-2.log              │
│ pid path          │ /root/.pm2/pids/mqtt-collector-2.pid             │
│ interpreter       │ /usr/bin/node                                    │
│ interpreter args  │ N/A                                              │
│ script id         │ 2                                                │
│ exec cwd          │ /var/www/mapmon                                  │
│ exec mode         │ cluster_mode                                     │
│ node.js version   │ 20.19.2                                          │
│ node env          │ production                                       │
│ watch & reload    │ ✘                                                │
│ unstable restarts │ 0                                                │
│ created at        │ 2025-07-11T11:45:15.845Z                         │
└───────────────────┴──────────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mqtt-collector <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 19.42 MiB │
│ Heap Usage             │ 94.93 %   │
│ Heap Size              │ 20.46 MiB │
│ Event Loop Latency p95 │ 1.11 ms   │
│ Event Loop Latency     │ 0.36 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mqtt-collector [--lines 1000]` to display logs
 Use `pm2 env 2` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mqtt-collector
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ДЕТАЛИ ПРОЦЕССОВ ==="
pm2 show mapmon
pm2 show mapmon-api
pm2 show mqtt-collector
=== ДЕТАЛИ ПРОЦЕССОВ ===
 Describing process with id 0 - name mapmon
┌───────────────────┬────────────────────────────────────────────┐
│ status            │ online                                     │
│ name              │ mapmon                                     │
│ namespace         │ default                                    │
│ version           │ 0.7.0                                      │
│ restarts          │ 1                                          │
│ uptime            │ 3h                                         │
│ entire log path   │ /var/www/mapmon/logs/mapmon-combined-0.log │
│ script path       │ /var/www/mapmon/.output/server/index.mjs   │
│ script args       │ N/A                                        │
│ error log path    │ /var/www/mapmon/logs/mapmon-error-0.log    │
│ out log path      │ /var/www/mapmon/logs/mapmon-out-0.log      │
│ pid path          │ /root/.pm2/pids/mapmon-0.pid               │
│ interpreter       │ /usr/bin/node                              │
│ interpreter args  │ N/A                                        │
│ script id         │ 0                                          │
│ exec cwd          │ /var/www/mapmon                            │
│ exec mode         │ cluster_mode                               │
│ node.js version   │ 20.19.2                                    │
│ node env          │ production                                 │
│ watch & reload    │ ✘                                          │
│ unstable restarts │ 0                                          │
│ created at        │ 2025-07-11T11:45:15.796Z                   │
└───────────────────┴────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 20.09 MiB │
│ Heap Usage             │ 69.97 %   │
│ Heap Size              │ 28.71 MiB │
│ Event Loop Latency p95 │ 1.25 ms   │
│ Event Loop Latency     │ 0.40 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon [--lines 1000]` to display logs
 Use `pm2 env 0` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon
 Describing process with id 1 - name mapmon-api
┌───────────────────┬──────────────────────────────────────────────┐
│ status            │ online                                       │
│ name              │ mapmon-api                                   │
│ namespace         │ default                                      │
│ version           │ 0.7.0                                        │
│ restarts          │ 1                                            │
│ uptime            │ 3h                                           │
│ entire log path   │ /var/www/mapmon/logs/api-combined-1.log      │
│ script path       │ /var/www/mapmon/server-backup/api-server.cjs │
│ script args       │ N/A                                          │
│ error log path    │ /var/www/mapmon/logs/api-error-1.log         │
│ out log path      │ /var/www/mapmon/logs/api-out-1.log           │
│ pid path          │ /root/.pm2/pids/mapmon-api-1.pid             │
│ interpreter       │ /usr/bin/node                                │
│ interpreter args  │ N/A                                          │
│ script id         │ 1                                            │
│ exec cwd          │ /var/www/mapmon                              │
│ exec mode         │ cluster_mode                                 │
│ node.js version   │ 20.19.2                                      │
│ node env          │ production                                   │
│ watch & reload    │ ✘                                            │
│ unstable restarts │ 0                                            │
│ created at        │ 2025-07-11T11:45:15.801Z                     │
└───────────────────┴──────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon-api <action_name>

 Code metrics value
┌────────────────────────┬─────────────┐
│ Used Heap Size         │ 14.27 MiB   │
│ Heap Usage             │ 78.32 %     │
│ Heap Size              │ 18.22 MiB   │
│ Event Loop Latency p95 │ 1.17 ms     │
│ Event Loop Latency     │ 0.39 ms     │
│ Active handles         │ 1           │
│ Active requests        │ 0           │
│ HTTP                   │ 0.2 req/min │
│ HTTP P95 Latency       │ 3 ms        │
│ HTTP Mean Latency      │ 1 ms        │
└────────────────────────┴─────────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon-api [--lines 1000]` to display logs
 Use `pm2 env 1` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon-api
 Describing process with id 2 - name mqtt-collector
┌───────────────────┬──────────────────────────────────────────────────┐
│ status            │ online                                           │
│ name              │ mqtt-collector                                   │
│ namespace         │ default                                          │
│ version           │ 0.7.0                                            │
│ restarts          │ 1                                                │
│ uptime            │ 3h                                               │
│ entire log path   │ /var/www/mapmon/logs/mqtt-combined-2.log         │
│ script path       │ /var/www/mapmon/server-backup/mqtt-collector.cjs │
│ script args       │ N/A                                              │
│ error log path    │ /var/www/mapmon/logs/mqtt-error-2.log            │
│ out log path      │ /var/www/mapmon/logs/mqtt-out-2.log              │
│ pid path          │ /root/.pm2/pids/mqtt-collector-2.pid             │
│ interpreter       │ /usr/bin/node                                    │
│ interpreter args  │ N/A                                              │
│ script id         │ 2                                                │
│ exec cwd          │ /var/www/mapmon                                  │
│ exec mode         │ cluster_mode                                     │
│ node.js version   │ 20.19.2                                          │
│ node env          │ production                                       │
│ watch & reload    │ ✘                                                │
│ unstable restarts │ 0                                                │
│ created at        │ 2025-07-11T11:45:15.845Z                         │
└───────────────────┴──────────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mqtt-collector <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 19.22 MiB │
│ Heap Usage             │ 92.79 %   │
│ Heap Size              │ 20.71 MiB │
│ Event Loop Latency p95 │ 1.12 ms   │
│ Event Loop Latency     │ 0.37 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mqtt-collector [--lines 1000]` to display logs
 Use `pm2 env 2` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mqtt-collector
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ПОСЛЕДНИЕ ЛОГИ PM2 ==="
pm2 logs --lines 20
=== ПОСЛЕДНИЕ ЛОГИ PM2 ===
[TAILING] Tailing last 20 lines for [all] processes (change the value with --lines option)
/root/.pm2/pm2.log last 20 lines:
PM2        | 2025-07-11T14:32:30: PM2 log: App [mapmon-api:1] online
PM2        | 2025-07-11T14:32:30: PM2 log: App [mqtt-collector:2] online
PM2        | 2025-07-11T14:43:59: PM2 log: Stopping app:mapmon id:0
PM2        | 2025-07-11T14:43:59: PM2 log: Stopping app:mapmon-api id:1
PM2        | 2025-07-11T14:43:59: PM2 log: App name:mapmon-api id:1 disconnected
PM2        | 2025-07-11T14:43:59: PM2 log: App [mapmon-api:1] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:43:59: PM2 log: App name:mapmon id:0 disconnected
PM2        | 2025-07-11T14:43:59: PM2 log: App [mapmon:0] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16315 msg=process killed
PM2        | 2025-07-11T14:44:00: PM2 log: Stopping app:mqtt-collector id:2
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16316 msg=process killed
PM2        | 2025-07-11T14:44:00: PM2 log: App name:mqtt-collector id:2 disconnected
PM2        | 2025-07-11T14:44:00: PM2 log: App [mqtt-collector:2] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16329 msg=process killed
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon:0] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon-api:1] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon-api:1] online
PM2        | 2025-07-11T14:45:15: PM2 log: App [mqtt-collector:2] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon:0] online
PM2        | 2025-07-11T14:45:15: PM2 log: App [mqtt-collector:2] online

/var/www/mapmon/logs/api-error-1.log last 20 lines:
/var/www/mapmon/logs/mapmon-error-0.log last 20 lines:
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:511:9)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   | 2025-06-27T16:51:49: [unhandledRejection] TypeError: Cannot read properties of undefined (reading 'size')
0|mapmon   |     at file:///var/www/mapmon/pages/history.vue:86:87
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:444:9)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:511:9)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   | 2025-06-27T17:56:21: [nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.

/var/www/mapmon/logs/mqtt-error-2.log last 20 lines:
2|mqtt-col | 2025-06-26T22:27:47: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:28:18: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:28:49: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:29:20: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:29:51: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:30:22: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:30:53: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:31:24: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:31:55: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:32:26: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:32:57: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:33:28: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:33:59: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:34:30: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:35:01: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:35:32: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:36:03: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-27T15:08:47: ❌ MQTT Error: Keepalive timeout
2|mqtt-col | 2025-07-06T20:54:19: ❌ MQTT Error: read ECONNRESET
2|mqtt-col | 2025-07-08T07:30:18: ❌ MQTT Error: read ECONNRESET

/var/www/mapmon/logs/mapmon-out-0.log last 20 lines:
0|mapmon   | 2025-06-27T16:50:25: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T16:58:08: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T17:55:54: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T18:22:16: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-28T11:26:42: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-04T18:20:24: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T01:17:30: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:13:55: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:17:54: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:22:29: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T10:19:26: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-08T16:32:12: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T00:26:26: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T09:01:39: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T15:58:37: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T21:51:43: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T12:04:25: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:15:00: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:32:31: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:45:16: Listening on http://0.0.0.0:3000

/var/www/mapmon/logs/mqtt-out-2.log last 20 lines:
2|mqtt-col | 2025-07-11T18:25:42: 📊 Processed data for device ESP32_Car_2046: {
2|mqtt-col |   id: 'ESP32_Car_2046',
2|mqtt-col |   lat: 55.7558,
2|mqtt-col |   lng: 37.6176,
2|mqtt-col |   speed: 0,
2|mqtt-col |   status: 'stopped',
2|mqtt-col |   battery: 82.91,
2|mqtt-col |   temperature: 23.5,
2|mqtt-col |   rpm: 741,
2|mqtt-col |   timestamp: 734185,
2|mqtt-col |   messageCount: 141,
2|mqtt-col |   rssi: -65,
2|mqtt-col |   freeHeap: 227656,
2|mqtt-col |   broker: 'Eclipse Mosquitto',
2|mqtt-col |   device_id: 'ESP32_Car_2046',
2|mqtt-col |   vehicle_id: 'ESP32_Car_2046'
2|mqtt-col | }
2|mqtt-col | 2025-07-11T18:25:42: 💾 SAVED TO SQLITE - ID: 11729
2|mqtt-col | 2025-07-11T18:25:42: 💾 SAVED TO SQLITE - ID: unknown
2|mqtt-col | 2025-07-11T18:25:42: 💾 Saved: OK

/var/www/mapmon/logs/api-out-1.log last 20 lines:
1|mapmon-a | 247562658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pc","res":{"statusCode":200},"responseTime":0.5452889949083328,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:05: {"level":30,"time":1752247565657,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pd","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":44088},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:05: {"level":30,"time":1752247565658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pd","res":{"statusCode":200},"responseTime":0.5329339951276779,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:11: {"level":30,"time":1752247571658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pe","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":50442},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:11: {"level":30,"time":1752247571660,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pe","res":{"statusCode":200},"responseTime":1.0958259999752045,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:14: {"level":30,"time":1752247574658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pf","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":50450},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:14: {"level":30,"time":1752247574659,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pf","res":{"statusCode":200},"responseTime":0.714834988117218,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:20: {"level":30,"time":1752247580662,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pg","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":56818},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:20: {"level":30,"time":1752247580664,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pg","res":{"statusCode":200},"responseTime":0.7631499916315079,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:23: {"level":30,"time":1752247583678,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1ph","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":56824},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:23: {"level":30,"time":1752247583680,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1ph","res":{"statusCode":200},"responseTime":1.467059001326561,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:30: {"level":30,"time":1752247590658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pi","req":{"method":"GET","url":"/api/telemetry/history?range=1h","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60366},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:30: {"level":30,"time":1752247590660,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pi","res":{"statusCode":200},"responseTime":2.1169589906930923,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:33: {"level":30,"time":1752247593657,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pj","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60372},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:33: {"level":30,"time":1752247593658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pj","res":{"statusCode":200},"responseTime":0.8087709993124008,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:36: {"level":30,"time":1752247596658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pk","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60374},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:36: {"level":30,"time":1752247596659,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pk","res":{"statusCode":200},"responseTime":0.6546109914779663,"msg":"request completed"}

1|mapmon-api  | 2025-07-11T18:26:49: {"level":30,"time":1752247609658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pl","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":48616},"msg":"incoming request"}
1|mapmon-api  | 2025-07-11T18:26:49: {"level":30,"time":1752247609661,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pl","res":{"statusCode":200},"responseTime":1.4615339934825897,"msg":"request completed"}
1|mapmon-api  | 2025-07-11T18:26:52: {"level":30,"time":1752247612643,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pm","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":48630},"msg":"incoming request"}
1|mapmon-api  | 2025-07-11T18:26:52: {"level":30,"time":1752247612645,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pm","res":{"statusCode":200},"responseTime":0.7036760002374649,"msg":"request completed"}
^C
root@5018543-bi97187:~#