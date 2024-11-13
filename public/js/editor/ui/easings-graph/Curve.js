import Keyframe from "./Keyframe";

export default class Curve {
	constructor(keyframes) {
		const linearKeySet = [new Keyframe({ time: 0 }), new Keyframe({ time: 1 })];

		if (!keyframes || !Array.isArray(keyframes)) {
			this.keyframes = linearKeySet;
		} else {
			this.keyframes = keyframes;

			if (keyframes.length < 2)
				this.keyframes.concat(
					linearKeySet.splice(keyframes.length, 2 - keyframes.length)
				);
		}

		this.sortKeyframes();
	}

	addKey(keyframe) {
		this.addKeyframes([keyframe]);
	}

	removeKey(keyframe) {
		const foundIndex = this.keyframes.findIndex(
			(kf) => kf.time === keyframe.time
		);
		if (foundIndex > 0 && foundIndex < this.keyframes.length - 1)
			this.keyframes.splice(foundIndex, 1);
	}

	addKeyframes(keyframes) {
		keyframes.forEach((k) => {
			const foundIndex = this.keyframes.findIndex((kf) => kf.time === k.time);
			if (foundIndex === 0 || foundIndex === this.keyframes.length - 1) return;
			if (foundIndex >= 0) {
				this.keyframes[foundIndex] = k;
			} else this.keyframes.push(k);
		});

		this.sortKeyframes();
	}

	GetClosestKeyframes(t) {
		t = Math.max(0, Math.min(1, t));
		var lo = -1,
			hi = this.keyframes.length;
		while (hi - lo > 1) {
			var mid = Math.round((lo + hi) / 2);
			if (this.keyframes[mid].time <= t) lo = mid;
			else hi = mid;
		}
		if (this.keyframes[lo].time === t) hi = lo;
		if (lo === hi) {
			if (lo === 0) hi++;
			else lo--;
		}
		return [lo, hi];
	}

	evaluate(t) {
		return this.hermite(t, this.keyframes).y;
	}

	hermite(t, keyframes) {
		const n = keyframes.length;

		const [lo, hi] = this.GetClosestKeyframes(t);

		var i0 = lo;
		var i1 = i0 + 1;

		if (i0 > n - 1) throw new Error("Out of bounds");
		if (i0 === n - 1) i1 = i0;

		var scale = keyframes[i1].time - keyframes[i0].time;

		t = (t - keyframes[i0].time) / scale;

		var t2 = t * t;
		var it = 1 - t;
		var it2 = it * it;
		var tt = 2 * t;
		var h00 = (1 + tt) * it2;
		var h10 = t * it2;
		var h01 = t2 * (3 - tt);
		var h11 = t2 * (t - 1);

		const x =
			h00 * keyframes[i0].time +
			h10 * keyframes[i0].outTangent * scale +
			h01 * keyframes[i1].time +
			h11 * keyframes[i1].inTangent * scale;

		const y =
			h00 * keyframes[i0].value +
			h10 * keyframes[i0].outTangent * scale +
			h01 * keyframes[i1].value +
			h11 * keyframes[i1].inTangent * scale;

		return { x, y };
	}

	sortKeyframes() {
		this.keyframes.sort((a, b) => a.time - b.time);
		this.firstKeyframe = this.keyframes[0];
		this.lastKeyframe = this.keyframes[this.keyframes.length - 1];
	}

	move(keyframe, time, value, boundFirstLast) {
		const keyIndex = this.keyframes.indexOf(keyframe);

		if (keyIndex <= 0 || keyIndex >= this.keyframes.length - 1) {
			if (!boundFirstLast) {
				keyframe.value = value;
			}
			return;
		}
		keyframe.value = value;
		keyframe.time = Math.max(0.001, Math.min(time, 0.999));

		this.sortKeyframes();
	}

	copy() {
		return new Curve(
			this.keyframes.map((keyframe) => {
				return new Keyframe({ ...keyframe });
			})
		);
	}
}
