# Hoop Flick

A one-minute basketball game. Drag the ball toward the hoop and release. The flick sets the shot.

Swishes score an extra point. Consecutive makes add a streak bonus, up to three extra points. The spot changes after every shot: close range and free throws are worth 2, wing and deep wing are worth 3.

## Play

```bash
npm start
```

Open `http://localhost:4173`.

Mouse, touch, and pen all work. Grab the ball, drag in the direction you want it to travel, and release. The dotted arc shows the flight and stops in the net when the shot is on line. It does not show bounces, so the backboard can still change a shot. You have 60 seconds.

Quit abandons the round without saving. Escape does the same.

## High scores

The top 10 scores are stored in this browser under `localStorage` key `hoopflick.scores.v1`. A score of zero is not saved. Once the board is full, a new score has to beat the lowest one. Ties stay with whoever got there first.

Clearing the board asks you to confirm. The mute button remembers its setting in `hoopflick.mute`.

## Tests

```bash
npm test
```

The physics tests check that every spot on the floor has a makeable swish, and the score tests check ordering, the 10-score cap, and bad saved data.
