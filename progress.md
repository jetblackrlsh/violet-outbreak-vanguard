Original prompt: Static GitHub Pages first-person superhero action game with AI-generated assets, waves, bosses, adaptive music, shielding, rocket fists, and tuning.

## 2026-06-04

- Current request: show death wave and total defeated on the end screen, add brief post-damage invulnerability, and show an invulnerability icon while active.
- Plan: keep stats in the existing game state, update result copy in `finish`, skip damage during invulnerability, and add a small HUD indicator.
- Follow-up request: add a rechargeable projectile-slow ability and remove projectiles fired by an enemy when that enemy is destroyed.
- Implemented: result stats, invulnerability badge/window, Slow Field button/key/gamepad control, slowed enemy bolt movement, and owner-based enemy bolt cleanup.
- Verified: syntax check, standard web-game Playwright client, natural defeat result stats, damage invulnerability badge, Slow Field timer/cooldown, and no orphaned enemy bolts after kills.
- Follow-up request: allow healing during its cooldown, but increase the point cost for each spam heal until the cooldown finishes.
- Verified heal spam: base heal cost `900`, cooldown-window spam cost escalates to `2295`, HUD switches to spam heal, and cost resets to `900` when cooldown reaches zero.
- Follow-up request: fix result-screen tracking for player defeats and completed waves, and improve the Slow Field graphic polish.
- Implemented: explicit `wavesCompleted` stat, result stats now separate wave reached, waves cleared, and player defeats; Slow Field now has an icon, active/recharge meter, and richer ability-panel styling.
- Follow-up request: add score costs for Slow Field and shield use.
- Implemented: Slow Field costs 300 points to activate, shield drains 45 score per second while active, and the Slow Field HUD shows cost/readiness.
- Follow-up request: increase healing point cost because healing is still too cheap.
- Implemented: base heal cost raised from 900 to 1500, which also raises cooldown-window spam heal cost through the existing multiplier.
- Follow-up request: prevent healing while the player is invulnerable.
- Implemented: heal input now fails during invulnerability and the heal HUD label shows `Invulnerable` while locked out.
