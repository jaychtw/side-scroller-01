# Formosa Quest

Formosa Quest is a bright 2D side-scrolling action game set along a nature-filled Taiwanese city greenway. Guide a tiny eco-explorer through construction hazards, clear five wandering city spirits, defeat a three-hit Formosan black bear mini-boss, and reach the transit gate.

Play the current release at [jaychtw.github.io/side-scroller-01](https://jaychtw.github.io/side-scroller-01/).

## Play locally

Requirements: Node.js 20.19 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. In a cloud environment, bind the server with `npm run dev -- --host 0.0.0.0`.

## Controls

- Move: `A` / `D` or left / right arrows
- Jump: `W`, up arrow, or space
- Strike: `J` or `X`
- Restart: `R`

The jump includes coyote time, input buffering, and variable height for responsive platforming.

## Useful commands

```bash
npm run dev        # start the development server
npm run typecheck  # check TypeScript
npm test           # run game-rule tests
npm run build      # create a production build in dist/
npm run preview    # serve the production build
```

## Project structure

- `src/game/scenes/GameScene.ts` contains the level, city backdrop, and encounter flow.
- `src/game/entities/Player.ts` controls movement, jumping, combat, and health.
- `src/game/entities/Enemy.ts` supports both floating spirits and the black-bear boss.
- `src/game/config.ts` contains movement tuning and the Formosa nature palette.
- `public/assets/characters/` contains the explorer, spirit, and bear artwork.

Future additions should build outward from this playable route: animation, sound, a map-authored city level, distinct spirit behaviors, and a full boss encounter.

