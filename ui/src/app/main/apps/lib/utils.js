export function addSeparator(val, separator, p1, p2) {
	return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
}

export function removeRedundunant(val) {
	return val ? val.replace(/, \(\)/gi, '').replace(/ \(\)/gi, '') : '';
}

export function numberToKorean(number) {
	const inputNumber = number < 0 ? false : number;
	const unitWords = ['', '만', '억', '조', '경'];
	const splitUnit = 10000;
	const splitCount = unitWords.length;
	const resultArray = [];
	let resultString = '';

	for (let i = 0; i < splitCount; i++) {
		let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
		unitResult = Math.floor(unitResult);
		if (unitResult > 0) {
			resultArray[i] = unitResult;
		}
	}

	for (let i = 1; i < resultArray.length; i++) {
		if (!resultArray[i]) continue;
		resultString = String(resultArray[i]) + unitWords[i] + resultString;
	}
	resultString += resultString !== '' ? '원' : '';
	return resultString;
}

export function numberToWon(number) {
	if (number === '') return '';
	const inputNumber = parseInt(String(number).replace(/,/gi, '')) * 100000000;
	// const inputNumber = number < 0 ? false : number;
	const unitWords = ['', '만', '억', '조', '경'];
	const splitUnit = 10000;
	const splitCount = unitWords.length;
	const resultArray = [];
	let resultString = '';

	for (let i = 0; i < splitCount; i++) {
		let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
		unitResult = Math.floor(unitResult);
		if (unitResult > 0) {
			resultArray[i] = unitResult;
		}
	}

	for (let i = 1; i < resultArray.length; i++) {
		if (!resultArray[i]) continue;
		resultString = String(resultArray[i]) + unitWords[i] + resultString;
	}
	resultString += resultString !== '' ? '' : '';
	return resultString;
}
