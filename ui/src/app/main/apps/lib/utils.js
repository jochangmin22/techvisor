export function addSeparator(val, separator, p1, p2) {
	return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
}

export function removeRedundunant(val) {
	return val ? val.replace(/, \(\)/gi, '').replace(/ \(\)/gi, '') : '';
}
