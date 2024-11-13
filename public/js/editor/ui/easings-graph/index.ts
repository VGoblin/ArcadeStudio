/** Reference: https://observablehq.com/@nhogs/easing-graphs-editor */

import * as d3 from "d3";
import "./styles.scss";
import chartEditor from "./chartEditor";
import  Curve  from "./Curve";
import Keyframe from "./Keyframe";
import stringToHtml from "./stringToHtml";
import { defaultEasing } from "../../libs/logicblock/constants";

/** @todo use Curve class as type. Current error: Can't use namespace as type */

let container = stringToHtml(
	`<div class="easings-graph-container" style="width:100vw, display:flex, justify-content:center,align-items:center,margin:100px auto, width:550px, height:500px, display:grid; place-items:center; margin-top:100px"></div>`
);


let currentChart: any;

function getEasingsEditor() {
	currentChart = chartEditor(chartEditorProps) as typeof currentChart;
	const { element, getCurve, getDuration } = currentChart;
	element.style.width = "700px";
	return currentChart;
}

const chartEditorProps = {
	easePreview: true,
	enableD3Easing: true,
	boundFirstLast: false,
	defaultCurve:undefined as null | any,
	duration: 5,
	onDurationChange: (duration: number) => {
		chartEditorProps.duration = duration;
		chartEditorProps.defaultCurve = createCurve(currentChart.getCurve());
		container.innerHTML = "";
		container.appendChild(getEasingsEditor().element);
	},
};

// container.appendChild(getEasingsEditor().element);
// document.body.appendChild(container);
// "


export function createCurve(curveStr: string | undefined) {
	if (!curveStr){
		curveStr = defaultEasing;
	}
	let curveVal:string|any[];
	/** if you directly parse curveStr, it will throw error if it's a string and not an array */
	try {
		curveVal=JSON.parse(curveStr) as any[];
	} catch {
		curveVal= curveStr;
	}
	
	let curve: any;
	if (typeof curveVal === "string") {
		curve = new Curve([
			new Keyframe({ time: 0, value: 0, inTangent: 0, outTangent: 0 }),
			new Keyframe({ time: 1, value: 1, inTangent: 0, outTangent: 0 }),
		]);
		curve.evaluate = d3[curveVal as keyof typeof d3] as any;
	} else {
		curve = new Curve(curveVal.map((f) => new Keyframe(f)));
	}
	return curve;
}


/** for time between 0 and 1? */
function getValueAtTime(curve: any, time: number) {
	return curve.evaluate(time);
}

