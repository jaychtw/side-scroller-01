# Emberfall

Emberfall is a small 2D side-scrolling action-game prototype. It is deliberately a complete, narrow “vertical slice”: traverse one level, defeat five sentinels, survive hazards, and unlock the exit gate.

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

The jump includes coyote time, input buffering, and variable height, which are three small details that make an action platformer feel much more responsive.

## Useful commands

```bash
npm run dev        # start the development server
npm run typecheck  # check TypeScript
npm test           # run game-rule tests
npm run build      # create a production build in dist/
npm run preview    # serve the production build
```

## Where to go next

Start by playing and tuning the movement values in `src/game/config.ts`. Once movement and combat feel right, a sensible order is:

1. Replace generated shapes with a small sprite sheet and animations.
2. Add sound effects and music.
3. Move level layout into Tiled or another map editor.
4. Add a second enemy that changes how the player moves.
5. Add one short boss encounter.

Avoid adding inventory, skill trees, procedural generation, or a large story until the basic loop is fun. A polished five-minute level teaches more than twenty unfinished systems.

