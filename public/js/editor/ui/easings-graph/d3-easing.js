import * as d3 from "d3";
export const width = 640;
const defaultHeight = 240;
export const height = defaultHeight;
export const margin = { top: 10, right: 20, bottom: 20, left: 30 };

export const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

/** @param upperLimit - upperLimit */

export function getX(upperLimit = 1) {
	const x = d3
		.scaleLinear()
		.range([margin.left, width - margin.right])
		.domain([0, upperLimit]);
	return x;
}

export const xAxis = (g, upperLimit = 1, height = defaultHeight) =>
	g
		.attr("transform", `translate(0,${height - margin.bottom + 6})`)
		.call(
			d3
				.axisBottom(getX(upperLimit).copy().interpolate(d3.interpolateRound))
				.ticks(width / 60)
		)
		.call((g) => g.select(".domain").remove())
		.call((g) =>
			g
				.selectAll(".tick line")
				.clone()
				.attr("stroke-opacity", 0.1)
				.attr("y1", margin.bottom + margin.top - height - 12)
		);

export const yAxis = (g) =>
	g
		.attr("transform", `translate(${margin.left - 6},0)`)
		.call(d3.axisLeft(y.copy().interpolate(d3.interpolateRound)).ticks(5))
		.call((g) => g.select(".domain").remove())
		.call((g) =>
			g
				.selectAll(".tick line")
				.clone()
				.attr("stroke-opacity", 0.1)
				.attr("x1", width - margin.left - margin.right + 12)
		);
