const rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300] as number[],
	negative: [0, -300, -240, -180, -120, -60] as number[],
} as const;

function getRotationIndex(rotation: number) {
	if (rotation == 0) return 0;
	if (rotation >= 360) rotation %= 360;
	else if (rotation <= -360) rotation %= -360;

	const sign = Math.sign(rotation) != -1 ? 'positive' : 'negative';
	return rotationIndexes[sign].indexOf(rotation);
}

function getHabitatSides(habitats: Array<any>, rotation: number): Array<any> {
	const habitatSides = new Array(6);
	if (habitats.length == 1) {
		habitatSides.fill(habitats[0]);
	} else {
		const [h1, h2] = habitats;
		let currentHabitat = h1;
		let habitatIndex = getRotationIndex(rotation);

		for (let i = 0; i < 6; i++) {
			habitatSides[habitatIndex] = currentHabitat;
			habitatIndex++;
			if (habitatIndex == 6) habitatIndex = 0;
			if (i == 2) currentHabitat = h2;
		}
	}
	return habitatSides;
}

const x = [0, 60, 120, 180, 240, 300, 0, -300, -240, -180, -120, -60];
x.forEach((v) => {
	console.log(getHabitatSides(['desert', 'swamp'], v));
});
