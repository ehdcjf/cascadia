export const mapLimits = {
        up: 10,
        down: 30,
        left: 10,
        right: 30,
} as const;

export const tokenNums = {
        bear: 20,
        salmon: 20,
        hawk: 20,
        elk: 20,
        fox: 20,
} as const;

export const rotationIndexes = {
        positive: [0, 60, 120, 180, 240, 300],
        negative: [0, -300, -240, -180, -120, -60],
}; 