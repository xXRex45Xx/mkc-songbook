/**
 * @fileoverview Dev-only DNS preload for the Atlas SRV lookup
 *
 * The local resolver (Tailscale DNS at 100.100.100.100) answers
 * `_mongodb._tcp.<cluster>` SRV queries with NXDOMAIN, so the
 * `mongodb+srv://` seed string never resolves and the driver crashes on
 * startup. A records for the shard hosts resolve fine on the same resolver.
 *
 * Node's `dns.setServers` applies to `dns.resolveSrv`, which is what the
 * MongoDB driver uses. Pointing it at public DNS fixes the SRV lookup only;
 * nothing else in the app's name resolution changes.
 *
 * Run with: `node --import ./scripts/dns-fix.js index.js`
 *
 * @module scripts/dns-fix
 */

import { setServers } from "node:dns/promises";

setServers(["8.8.8.8", "1.1.1.1"]);
