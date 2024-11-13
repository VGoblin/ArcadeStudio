import * as d3 from "d3";
const width = 640;
const height = 48;
import { xAxis, yAxis, margin, getX, y } from "./d3-easing";

export default function chartEase(ease, invalidation, duration, loop = true) {
	const x = getX(1);
	const svg = d3
		.create("svg")
		.attr("viewBox", [0, 0, width, height])
		.style("max-width", `${width}px`)
		.style("overflow", "visible")
		.style("cursor", "pointer")
		.on("click", () => !loop && animate(0));

	const circle = svg
		.append("circle")
		.attr("cx", x(0))
		.attr("cy", (height - margin.bottom + margin.top) / 2)
		.attr("r", 12);
	// svg.append("g").call((param) => xAxis(param, height));
	const restartDelay = 0;
	const restartCircleGrowDuration = 0;
	const animationDuration = duration * 1000;

	const totalAnimationTime =
		restartDelay + animationDuration + restartCircleGrowDuration;

	function animate(delay) {
		circle
			.transition()
			.ease(ease)
			.delay(delay)
			.duration(animationDuration)
			.attrTween("r", () => (circle.attr("r", 12), null))
			.attrTween("cx", () => x)
			.transition()
			.delay(restartDelay)
			.duration(restartCircleGrowDuration)
			.ease(d3.easeCubicIn)
			.attr("r", 0)
			.transition()
			.attr("cx", x(0))
			.transition()
			.ease(d3.easeCubicOut)
			.attr("r", 12);
	}

	let loopInterval = null;

	if (loop) {
		animate(0);
		loopInterval = setInterval(() => {
			animate(0);
		}, totalAnimationTime);
	}
	// const observer = new IntersectionObserver(
	// 	(entries) => {
	// 		const entry = entries.pop();
	// 		if (entry.intersectionRatio >= 0.9) animate(500);
	// 		else if (entry.intersectionRatio <= 0) circle.interrupt();
	// 	},
	// 	{
	// 		threshold: [0, 0.9],
	// 	}
	// );
	// observer.observe(svg.node());
	// invalidation && invalidation.then(() => observer.disconnect());
	const returnVal = svg.node();
	return returnVal;
}
