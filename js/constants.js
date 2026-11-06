export const VIEW = { w: 600, h: 680 };
export const FLOOR_Y = 550;
export const BALL_R = 28;
export const GRAVITY = 860;
export const FLICK_SCALE = 3.85;
export const MAX_DRAG = 250;
export const MIN_DRAG = 24;
export const ROUND_SECONDS = 60;
export const SCORE_KEY = "hoopflick.scores.v1";
export const MUTE_KEY = "hoopflick.mute";
export const NAME_KEY = "hoopflick.name";
export const MAX_SCORES = 10;

export const RIM = {
  halfGap: 62,
  rimR: 7,
};

export const STATIONS = [
  { id: "near", name: "Close range", points: 2, ballX: 188, hoopX: 336, hoopY: 318 },
  { id: "free", name: "Free throw", points: 2, ballX: 142, hoopX: 368, hoopY: 286 },
  { id: "wing", name: "Wing", points: 3, ballX: 104, hoopX: 404, hoopY: 254 },
  { id: "deep", name: "Deep wing", points: 3, ballX: 72, hoopX: 436, hoopY: 228 },
];
