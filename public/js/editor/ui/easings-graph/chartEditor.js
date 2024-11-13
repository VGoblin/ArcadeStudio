import * as d3 from "d3";
import chartEase from "./chart";
import Curve from "./Curve";
import { width, height, xAxis, yAxis, margin, y, getX } from "./d3-easing";
import { d3EaseFunction } from "./easeFunction";
import Keyframe from "./Keyframe";
import html from "./stringToHtml";

export default function chartEditor(config = {}) {
	let {
		easePreview,
		boundFirstLast = false,
		defaultCurve,
		enableD3Easing = false,
		title,
		duration,
		onDurationChange,
	} = config;
	let useD3Easing = false;
	let editor = html(`<div style="display:inline-block" ></div>`);
	const x = getX(1);

	let titleEditor = html(`<span style="font: 700 1.5rem sans-serif;"
		>${title}</span
	>`);
	let durationInput = html(
		`<span>Duration:<input min=0 step=0.5 value=${duration} name=duration type=number /></span>`
	);

	onDurationChange &&
		durationInput.addEventListener("change", (e) => {
			onDurationChange(durationInput.querySelector("input").value, e);
		});
	let resetButton = `<button name=reset type="button" style="margin-right:1px">Reset</button>`;
	let copyButton = `<button name=copy style="margin-right:20px">Copy</button>`;
	let easingSelect = `<span style="display:${
		enableD3Easing ? "auto" : "none"
	}"><select name=d3Ease><option value="undefined" disabled>Custom</option>${d3EaseFunction.map(
		(easeF) =>
			{
				return `<option value=${easeF} ${
				defaultCurve === easeF ? `selected="selected"` : ""
				}>${easeF}</option>`
			}
	)}</select></span>`;
	let action = html(`<form style="margin-left:0px">
		${resetButton}  ${easingSelect}
	</form>`);
	// editor.appendChild(html(easingSelect))
	// editor.appendChild(html(resetButton))
	action.appendChild(durationInput);

	// console.log(easingSelect, durationInput, resetButton)
	let previewTitle = html(`<div>Ease preview</div>`);

	let curve = new Curve([
		new Keyframe({ time: 0, value: 0, inTangent: 0, outTangent: 0 }),
		new Keyframe({ time: 1, value: 1, inTangent: 0, outTangent: 0 }),
	]);

	if (defaultCurve !== undefined) {
		if (typeof defaultCurve === "string") {
			useD3Easing = true;
		} else {
			action.d3Ease.value = undefined;
			curve = defaultCurve.copy();
		}
	} else {
		action.d3Ease.value = undefined;
	}

	const line = d3.line();

	action.d3Ease.onchange = (event) => {
		useD3Easing = true;
		updateValue();
		update(true);
	};

	action.reset.onclick = (event) => {
		resetCurve();
		updateValue();
		update(true);
	};

	action.onsubmit = (event) => {
		event.preventDefault();
	};

	// action.copy.onclick = (event) => {
	// 	useD3Easing
	// 		? console.log(`d3.${action.d3Ease.value}()`)
	// 		: // : console.log(
	// 		  // 		`new Curve([${curve.keyframes
	// 		  // 			.map((k) => `new Keyframe(${JSON.stringify(k)})`)
	// 		  // 			.join(",")}])`
	// 		  //   );
	// 		  console.log(
	// 				`[${curve.keyframes.map((k) => `${JSON.stringify(k)}`).join(",")}]`
	// 		  );
	// };

	function resetCurve() {
		if (defaultCurve !== undefined) {
			if (typeof defaultCurve === "string") {
				useD3Easing = true;
				curve = new Curve([
					new Keyframe({ time: 0, value: 0, inTangent: 0, outTangent: 0 }),
					new Keyframe({ time: 1, value: 1, inTangent: 0, outTangent: 0 }),
				]);
				action.d3Ease.value = defaultCurve;
			} else {
				action.d3Ease.value = undefined;
				useD3Easing = false;
				curve = defaultCurve.copy();
			}
		} else {
			action.d3Ease.value = undefined;
			useD3Easing = false;
			curve = new Curve([
				new Keyframe({ time: 0, value: 0, inTangent: 0, outTangent: 0 }),
				new Keyframe({ time: 1, value: 1, inTangent: 0, outTangent: 0 }),
			]);
		}
	}

	const svg = d3
		.create("svg")
		.attr("cursor", "pointer")
		.attr("viewBox", [0, 0, width, height])
		.style("max-width", `${width}px`)
		.style("overflow", "visible");

	svg
		.append("g")
		.call((g) => xAxis(g, duration))
		.call((g) =>
			g
				.append("text")
				.attr("x", width - margin.right)
				.attr("y", -3)
				.attr("fill", "currentColor")
				.attr("font-weight", "bold")
				.text("t")
		);

	svg
		.append("g")
		.call(yAxis)
		.call((g) =>
			g
				.select(".tick:last-of-type text")
				.clone()
				.attr("x", 3)
				.attr("text-anchor", "start")
				.attr("font-weight", "bold")
				.text("t′")
		);

	let g = svg
		.append("g")
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", 1.5)
		.attr("stroke-linecap", "round");

	svg.on("click", function (d) {
		if (d3.event?.defaultPrevented) return;

		if (useD3Easing) {
			// const tempDefaultCurve = defaultCurve;
			// defaultCurve = curve;
			resetCurve();
			// defaultCurve = tempDefaultCurve;

			useD3Easing = false;
		}
		action.d3Ease.value = undefined;
		curve.addKey(
			new Keyframe({
				time: x.invert(d3.mouse(this)[0]),
				value: y.invert(d3.mouse(this)[1]),
			})
		);
		updateValue();
		update(true);
	});

	function updateValue() {
		if (useD3Easing) {
			curve.evaluate = d3[action.d3Ease.value];
		}
		editor.value = (t) => curve.evaluate(t);
		editor.dispatchEvent(new CustomEvent("input"));
	}

	function update(runTransition) {
		g.selectAll("path")
			.data([(t) => curve.evaluate(t)])
			.join("path")
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-width", 1.5)
			.attr("stroke-linecap", "round")
			.transition()
			.duration(runTransition ? 500 : 0)
			.attr("d", (e) =>
				line(d3.ticks(0, 1, width).map((t) => [x(t), y(e(t))]))
			);

		g.selectAll(".tangentesCont")
			.data(useD3Easing ? [] : curve.keyframes, (d, i) => d.id)
			.join((enter) =>
				enter
					.append("g")
					.attr("class", "tangentesCont")
					.each(function (d) {
						d3.select(this)
							.append("line")
							.attr("opacity", (d) => (d.id === curve.firstKeyframe.id ? 0 : 1))
							.attr("class", "inTangLine")
							.attr("fill", "none")
							.attr("stroke", "#008ec4");

						d3.select(this)
							.append("line")
							.attr("class", "outTangLine")
							.attr("opacity", (d) => (d.id === curve.lastKeyframe.id ? 0 : 1))
							.attr("fill", "none")
							.attr("stroke", "#008ec4");

						d3.select(this)
							.append("circle")
							.attr("stroke", "black")
							.attr("opacity", (d) => (d.id === curve.firstKeyframe.id ? 0 : 1))
							.attr("class", "inTangKey")
							.attr("stroke", "#008ec4")
							.attr("fill", "#008ec4")
							.attr("r", 5)
							.attr("cursor", "move")
							.call(
								d3
									.drag()
									.on("start", dragstartedKey)
									.on("drag", draggedTangIn)
									.on("end", dragendedKey)
							);

						d3.select(this)
							.append("circle")
							.attr("stroke", "black")
							.attr("opacity", (d) => (d.id === curve.lastKeyframe.id ? 0 : 1))
							.attr("class", "outTangKey")
							.attr("stroke", "#008ec4")
							.attr("fill", "#008ec4")
							.attr("r", 5)
							.attr("cursor", "move")
							.call(
								d3
									.drag()
									.on("start", dragstartedKey)
									.on("drag", draggedTangOut)
									.on("end", dragendedKey)
							);

						d3.select(this)
							.append("circle")
							.attr("class", "keyframe")
							.attr("stroke", "black")
							.attr("fill", "white")
							.attr("r", 5)
							.attr("cursor", "move")
							.on("contextmenu", (d) => {
								d3.event.preventDefault();
								curve.removeKey(d);
								updateValue();
								update(true);
							})
							.call(
								d3
									.drag()
									.on("start", dragstartedKey)
									.on("drag", draggedKey)
									.on("end", dragendedKey)
							);
					})
			)
			.each(function (d) {
				d3.select(this)
					.select(".keyframe")
					.attr("cx", x(d.time))
					.attr("cy", y(d.value))
					.attr("cursor", "move");

				d3.select(this)
					.select(".inTangKey")
					.attr("cx", x(d.getHandles().in.x))
					.attr("cy", y(d.getHandles().in.y))
					.attr("cursor", "move");

				d3.select(this)
					.select(".outTangKey")
					.attr("cx", x(d.getHandles().out.x))
					.attr("cy", y(d.getHandles().out.y));

				d3.select(this)
					.select(".inTangLine")
					.attr("stroke-width", "1")
					.attr("x1", x(d.getHandles().in.x))
					.attr("y1", y(d.getHandles().in.y))
					.attr("x2", x(d.time))
					.attr("y2", y(d.value));

				d3.select(this)
					.select(".outTangLine")
					.attr("stroke-width", "1")
					.attr("x1", x(d.time))
					.attr("y1", y(d.value))
					.attr("x2", x(d.getHandles().out.x))
					.attr("y2", y(d.getHandles().out.y));
			});
	}

	function dragstartedKey(d, i) {
		d3.select(this).raise().attr("r", 6);
	}

	function draggedKey(d) {
		curve.move(
			d,
			x.invert(d3.mouse(this)[0]),
			y.invert(d3.mouse(this)[1]),
			boundFirstLast
		);
		update();
	}

	function dragendedKey(d, i) {
		d3.select(this).raise().attr("r", 5);

		updateValue();
		update();
	}

	function draggedTangIn(d) {
		d.setInTangentFromHandle(
			x.invert(d3.mouse(this)[0]),
			y.invert(d3.mouse(this)[1])
		);
		update();
	}

	function draggedTangOut(d) {
		d.setOutTangentFromHandle(
			x.invert(d3.mouse(this)[0]),
			y.invert(d3.mouse(this)[1])
		);
		update();
	}

	updateValue();
	update();

	// if (title !== undefined) editor.append(titleEditor);
	editor.appendChild(action);
	if (easePreview) {
		// editor.append(previewTitle);
		editor.appendChild(
			chartEase(
				(t) => {
					const val = curve.evaluate(t);
					return val;
				},
				null,
				duration
			)
		);
	}
	editor.appendChild(html("<br/>"));
	editor.appendChild(svg.node());

	return {
		element: editor,
		getCurve() {
			return useD3Easing
				? action.d3Ease.value
				: `[${curve.keyframes.map((k) => `${JSON.stringify(k)}`).join(",")}]`;
		},
		getDuration() {
			return durationInput.querySelector("input").value;
		},
	};
}
