const DOM = {
	uid: () => ({
		id: Math.random(),
	}),
};
export default class Keyframe {
	constructor({ time, value, inTangent, outTangent }) {
		this.time = Math.max(0, Math.min(1, time)) || 0;
		this.value = value || 0;
		this.inTangent = inTangent || 0;
		this.outTangent = outTangent || 0;
		this.id = DOM.uid().id;
		this.inMagnitude = -0.1;
		this.outMagnitude = 0.1;
	}

	getHandles() {
		return { in: this.getInHandle(), out: this.getOutHandle() };
	}

	getInHandle() {
		return {
			x: this.time + this.inMagnitude,
			y: this.value + this.inMagnitude * this.inTangent,
		};
	}

	getOutHandle() {
		return {
			x: this.time + this.outMagnitude,
			y: this.value + this.outMagnitude * this.outTangent,
		};
	}

	setTangentsFromHandles(tangents) {
		this.setInTangentFromHandle(tangents.in.x, tangents.in.y);
		this.setOutTangentFromHandle(tangents.out.x, tangents.out.y);
	}

	setInTangentFromHandle(x, y) {
		if (x >= this.time) return;
		this.inMagnitude = x - this.time;
		this.inTangent = (y - this.value) / this.inMagnitude;
	}

	setOutTangentFromHandle(x, y) {
		if (x <= this.time) return;
		this.outMagnitude = x - this.time;
		this.outTangent = (y - this.value) / this.outMagnitude;
	}
}
