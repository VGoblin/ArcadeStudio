export default function stringToHtml(string: string) {
	const div = document.createElement("div");
	div.innerHTML = string;
	let elem = div.children[0];
	// elem.remove();
	return elem;
}
