/**
 *
 * @param {*} params
 * @param {*} inputSearchText needs to be updated ? newSearchText : null
 * 1. mistype handle, convert and or -> ; +
 * 2. convert to SearchText with Parenthesis
 * 3. update params value for UI
 * 4. create api parameters
 * example :
 * A (B C)      -> A;(B C)
 * A and (B C)  -> "
 * A B C        -> A;B;C
 * A and B      -> A;B
 * A or B       -> A+B
 * A or B and C -> (A+B);C
 * A and B or C -> A;(B+C)
 */

export default function parseSearchText(params, inputSearchText) {
	/**
	 * mistype handle,  ;+ convert
	 */
	const searchText = inputSearchText
		? splitArgs(
				inputSearchText.toString().toLowerCase().replace(/  +/g, ' ') // replace multiple spaces to single space
		  ) // from SearchHeader
		: params.terms.map(item => item.join('+')).join(';'); // from LeftSiderTerms
	/**
	 * make Terms array
	 */
	const newTerms = inputSearchText
		? searchText.split(';').map(
				item => (/_/.test(item) ? `${item.replace(/_/gi, ' ')}`.split('+') : item.split('+')) // convert _ to whitespace
		  ) // from SearchHeader
		: params.terms; // from LeftSiderTerms
	/**
	 *  convert SearchText to newSearchText with parenthesis
	 */
	let needParenthesis = false;
	let newSearchText = '';
	const result = searchText.split(';');
	for (let i = 0; i < result.length; i++) {
		if (result[i].includes('+') && !result[i].includes('(')) needParenthesis = true;
		else needParenthesis = false;
		if (needParenthesis) {
			newSearchText += `(${result[i]});`;
		} else {
			newSearchText += `${result[i]};`;
		}
	}
	if (newSearchText.endsWith(';')) newSearchText = newSearchText.slice(0, -1);

	/**
	 * update params value for UI
	 */
	const { ...newParams } = params;
	newParams.searchText = newSearchText;
	newParams.terms = newTerms;

	/**
	 * create api parameters
	 */
	const { terms: _, ...newApiParams } = params; // terms not use at api params

	newApiParams.searchText = newSearchText;
	newApiParams.inventor = params.inventor.join('+');
	newApiParams.assignee = params.assignee.join('+');
	newApiParams.patentOffice = params.patentOffice.join('+');
	newApiParams.language = params.language.join('+');
	newApiParams.status = params.status.join('+');
	newApiParams.ipType = params.ipType.join('+');

	return [newParams, newApiParams];
}
// 단백질;추출물;정제 함유 -> 단백질+추출물+정제+함유
function splitArgs(myString) {
	/**                step 1            step 2          step 3
	 * A (B C)      -> [A,B C]        -> A;B_C        -> A;B_C
	 * A and (B C)  -> [A,and,B C]    -> A;and;B_C    -> A;B_C
	 * A B C        -> [A,B,C]        -> A;B;C        -> A;B;C
	 * A and B      -> [A,and,B]      -> A;and;B      -> A;B
	 * A or B       -> [A,or,B]       -> A;or;B       -> A+B
	 * A or B and C -> [A,or,B,and,C] -> A;or;B;and;C -> A+B;C
	 * A and B or C -> [A,and,B,or,C] -> A;and;B;or;C -> A;B+C
	 * A & B | C    -> [A,&,B,|,C]    -> A;&;B;|;C    -> A;B+C
	 * A;B C        -> [A;B,C]        -> A;B;C        -> A;B;C
	 * (A+B);C      -> [A+B,;C]       -> A+B;;C       -> A+B;C
	 */
	// change to Parenthesis to quotes - (hello) world -> "hello" world
	myString = myString.replace(/\((.*?)\)/g, '"$1"');
	// console.log('TCL: splitArgs -> myString', myString);

	const myRegexp = /[^\s"]+|"([^"]*)"/g;
	const myArray = [];
	let match = '';
	do {
		match = myRegexp.exec(myString);
		if (match != null) {
			// Index 1 in the array is the captured group if it exists
			// Index 0 is the matched text, which we use if no captured group exists
			myArray.push(match[1] ? match[1] : match[0]);
		}
	} while (match != null);
	// console.log('TCL: splitArgs -> myArray', myArray);
	/**
	 * step 1 done
	 */
	let myResult = myArray.map(item => (/\s/.test(item) ? `${item.replace(/ /gi, '_')}` : item)).join(';');
	// console.log('TCL: splitArgs -> myResult', myResult);
	/**
	 * step 2 done
	 */
	myResult = myResult
		.replace(/;and;/gi, ';')
		.replace(/;or;/gi, '+')
		.replace(/;&;/gi, ';')
		.replace(/;\|;/gi, '+')
		.replace(/;;/gi, ';');
	/**
	 * step 3 done
	 */
	return myResult;
}
