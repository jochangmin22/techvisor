/**
 *
 * @param {*} params
 * @param {*} inputSearchText needs to be updated ? searchTextParenthesis : null
 * 1. mistype handle, convert and or -> ; +
 * 2. convert to SearchText with Parenthesis
 * 3. update params value for UI
 * 4. create api parameters
 * example :
 * A (B C)                -> A AND (B OR C)
 * A and (B C)            -> "
 * A B C                  -> A AND B AND C
 * A and B                -> A AND B
 * A or B                 -> A OR B
 * A or B and C           -> (A OR B) AND C
 * A and B or C           -> A AND (B OR C)
 * A and B and C ADJ1 D   -> A and B and (C ADJ1 D)
 */

export function parseInputSearchText(inputSearchText = null) {
	// parse InputSearchText from CompanyContentToolbar
	/**
	 * mistype handle,  ;+ convert
	 */

	// predefined objects and arrays
	const tempObj = {
		CA: 'companyAddress',
		BD: 'bizDomain',
		RK: 'relatedKeyword',
		IN: 'industry'
	};

	const tempArr = [
		'marketCapStart',
		'marketCapEnd',
		'foundedStart',
		'foundedEnd',
		'employeeStart',
		'employeeEnd',
		'repAgeStart',
		'repAgeEnd'
	];

	const searchText = splitArgs(
		inputSearchText
			.toString()
			// .toLowerCase()
			.replace(/  +/g, ' ') // replace multiple spaces to single space
	);
	/**
	 * make Terms array
	 */

	// a and b and c and @ad>=d<=e and (f OR g).ap and (h).inv -> newCompanyName = [a,b,c]
	const newCompanyName = searchText
		.split(' and ')
		.filter(function (item) {
			if (/\(@(.*?)|(.*?)\.CA|(.*?)\.BD|(.*?)\.RK|(.*?)\.CC|(.*?)\.IN/gi.test(item)) {
				return false; // skip if not companyName (.CN)
			}
			return true;
		})
		.map(function (item) {
			return item.split(' or ');
		});
	// item => (/_/.test(item) ? `${item.replace(/_/gi, ' ')}`.split(' or ') : item.split(' or ')) // convert _ to whitespace

	/**
	 *  convert searchText to searchTextParenthesis with parenthesis
	 */
	let searchTextParenthesis = addParenthesis(searchText);

	/**
	 * update params value for UI
	 */
	// CA, BD, RK, CC, IN, MC, FD, EM, RA
	let { ...newParams } = {};
	newParams.searchText = searchTextParenthesis;
	newParams.companyName = newCompanyName;

	Object.entries(tempObj).map(([key, value]) => {
		const testRE = new RegExp('/(.*?).' + key + '/', 'gi');
		const replaceRE = new RegExp('/((.*?)).' + key + '/', 'gi');
		newParams[value] = searchText
			.split(' and ')
			.filter(function (item) {
				if (testRE.test(item)) {
					return true;
				}
				return false;
			})
			.map(function (item) {
				return item.replace(replaceRE, '$1').replace(/"/g, '').toLowerCase().split(' or ');
			})[0];
		return undefined;
	});

	let paramDate = searchText.split(' and ').filter(function (item) {
		if (/(?<=\(@)/gi.test(item)) {
			return true;
		}
		return false;
	})[0];

	if (paramDate !== undefined) {
		// let result = '';
		// if (/(?<=\(@)(.*?)(?=>)/gi.test(paramDate)) {
		// 	result = paramDate.match(/(?<=\(@)(.*?)(?=>)/gi)[0];
		// } else if (/(?<=\(@)(.*?)(?=<)/gi.test(paramDate)) {
		// 	result = paramDate.match(/(?<=\(@)(.*?)(?=<)/gi)[0];
		// }

		// dateType Typo handle
		// if (!['PRD', 'AD', 'PD', 'FD'].includes(result)) {
		// 	// not include
		// 	let defaultDateType = 'AD';
		// 	if (['PRD', 'AD', 'PD', 'FD'].includes(result.replace(/_/gi, ''))) {
		// 		// if it's similar to 4 values
		// 		defaultDateType = result.replace(/_/gi, '');
		// 	}
		// 	newParams.searchText = newParams.searchText.replace(result, defaultDateType);
		// 	searchTextParenthesis = searchTextParenthesis.replace(result, defaultDateType);
		// 	paramDate = paramDate.replace(result, defaultDateType);
		// 	result = defaultDateType;
		// }
		// newParams.dateType = result;

		const dNumber = paramDate.replace(/\D/g, '');
		const dOperator = paramDate.replace(/[0-9]/g, '').replace(/@PRD|@AD|@PD|@FD/gi, '');
		if (dNumber) {
			if (dNumber.length === 8) {
				// >=A<=B, >=A, <=B, =A
				if (dOperator === '>=' || dOperator === '>' || dOperator === '=') {
					newParams.foundedStart = dNumber;
				} else {
					newParams.foundedEnd = dNumber;
				}
			}
			if (dNumber.length === 16) {
				newParams.foundedStart = dNumber.slice(0, 8);
				newParams.foundedEnd = dNumber.slice(8, 16);
			}
		}
	} else {
		// newParams.dateType = '';
		newParams.foundedStart = '';
		newParams.foundedEnd = '';
	}
	Object.values(tempObj).map(key => (newParams[key] = newParams[key] || []));
	tempArr.map(key => (newParams[key] = newParams[key] || ''));

	/**
	 * create api parameters
	 */
	const { companyName: _, ...newApiParams } = newParams; // companyName are not required in api params

	newApiParams.searchText = searchTextParenthesis;
	Object.values(tempObj).map(key => {
		newApiParams[key] = newParams[key].join(' or ');
		return undefined;
	});

	return [newParams, newApiParams];
}
export default function parseSearchOptions(params) {
	// parse SearchOptions params from LeftSiderTerm
	/**
	 * mistype handle,  ;+ convert
	 */

	const searchText = mergeArgs(params);

	/**
	 * make Terms array
	 */

	// a and b and c and @ad>=d<=e and (f OR g).ap and (h).inv -> newCompanyName = [a,b,c]
	const newCompanyName = params.companyName;

	/**
	 *  convert searchText to searchTextParenthesis with parenthesis
	 */
	let searchTextParenthesis = addParenthesis(searchText);

	/**
	 * update params value for UI
	 */
	let { ...newParams } = params;
	newParams.searchText = searchTextParenthesis;
	newParams.companyName = newCompanyName;
	/**
	 * create api parameters
	 */
	const { companyName: _, ...newApiParams } = params;

	newApiParams.searchText = searchTextParenthesis;
	['companyAddress', 'bizDomain', 'relatedKeyword', 'industry'].map(key => {
		newApiParams[key] = params[key].join(' or ');
		return undefined;
	});

	return [newParams, newApiParams];
}

function splitArgs(myString) {
	/**                    step 1            step 2            step 3
	 * A AND B AND C AND (@AD>=D<=E) AND (F OR "G H").AP AND (I).INV
	 * -> step 0 : A AND B AND C AND "⁋@AD>=D<=E¶" AND "⁋F_OR_~G_H~¶.AP" AND "⁋I¶".INV
	 * -> step 1 : [A,AND,B,AND,C,AND,⁋@AD>=D<=E¶,AND,⁋F_OR_~G_H~¶.AP,AND,⁋H¶.INV]
	 * -> step 2 : [A;AND;B;AND;C;AND;⁋@AD>=D<=E¶;AND;⁋F_OR_~G_H~¶.AP;AND;⁋H¶.INV]
	 * -> step 3 : [A AND B AND C AND (@AD>=D<=E) AND (F OR "G H").AP AND (H).INV]
	 */
	// change Parenthesis of .AP.INV to ⁋ ¶, double quotes to ~ ; (F OR "G H").AP world -> "⁋F_OR_~G_H~¶.AP"
	// and change Parenthesis to quotes

	// CN, CA, BD, RK, CC, IN, MC, FD, EM, RA
	myString = myString
		.split(' and ')
		.map(
			item =>
				/@(.*?)|(.*?)\.CA|(.*?)\.BD|(.*?)\.RK|(.*?)\.CC|(.*?)\.IN|(.*?)\.MC|(.*?)\.FD|(.*?)\.EM|(.*?)\.RA/gi.test(
					item
				)
					? `"${item.replace(/\(/gi, '⁋').replace(/\)/gi, '¶').replace(/ /gi, '_').replace(/"/gi, '~')}"`
					: item
			// : '⁋' + item + '¶.CN'
		)
		.join(' and ');
	// console.log('TCL: splitArgs -> myString', myString);

	// change to Parenthesis to quotes - (hello) world -> "hello" world
	myString = myString.replace(/\((.*?)\)/gi, '"$1"');
	// console.log('step 0:', myString);

	// step 0 done

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
	// console.log('step 1:', myArray);
	/**
	 * step 1 done
	 */
	let myResult = myArray.map(item => (/\s/.test(item) ? `${item.replace(/ /gi, '_')}` : item)).join(';');
	// console.log('step 2:', myResult);
	/**
	 * step 2 done
	 */
	myResult = myResult
		.replace(/⁋/g, '(')
		.replace(/¶/g, ')')
		.replace(/~/g, '"')
		.replace(/;and;/g, ' and ')
		.replace(/;AND;/g, ' AND ')
		.replace(/;or;/g, ' or ')
		.replace(/;OR;/g, ' OR ')
		.replace(/_or_/g, ' or ')
		.replace(/_OR_/g, ' OR ')
		.replace(/;&;/g, ' and ')
		.replace(/;\|;/g, ' or ')
		.replace(/;/g, ' and ')
		.replace(/;;/g, ' and ')
		.replace(/_/gi, ' ');
	/**
	 * step 3 done
	 */
	// console.log('step 3:', myResult);

	return myResult;
}

function mergeArgs(params) {
	// addParenthesis 는 여기서 안함
	// CN, CA, BD, RK, CC, IN, MC, FD, EM, RA
	const tempObj = {
		// companyName: 'CN',
		companyAddress: 'CA',
		bizDomain: 'BD',
		relatedKeyword: 'RK',
		industry: 'IN'
	};
	const tempObj2 = {
		marketCap: 'MC',
		founded: 'FD',
		employee: 'EM',
		repAge: 'RA'
	};

	let my = {};
	// my['result'] = params.searchText && params.searchText.length > 0 ? params.searchText + ' and ' : '';
	my['result'] = '';

	my['result'] +=
		params['companyName'] && params['companyName'].length > 0
			? params['companyName'].map(item => item.join(' or ')).join(' and ') + ' and '
			: '';
	// tempObj
	Object.entries(tempObj).map(([key, value]) => {
		// my[key] = params[key] && params[key].length > 0 ? '(' + params[key] + ').' + value + ' and ' : '';
		my[key] =
			params[key] && params[key].length > 0
				? '(' +
				  params[key].map(item => (/\s/.test(item) ? '"' + item + '"' : item)).join(' or ') +
				  ').' +
				  value +
				  ' and '
				: '';
		my['result'] += my[key];
		return undefined;
	});
	// tempObj2
	Object.entries(tempObj2).map(([key, value]) => {
		my[key] = '(@' + value;
		my[key] += params[key + 'Start'] && params[key + 'Start'].length > 0 ? '>=' + params[key + 'Start'] : '';
		my[key] +=
			params[key + 'End'] && params[key + 'End'].length > 0 ? '<=' + params[key + 'End'] + ') and ' : ') and ';
		my[key] = my[key] === '(@' + value + ') and ' ? '' : my[key];
		my['result'] += my[key];
		return undefined;
	});

	if (my['result'].endsWith(' and ')) my['result'] = my['result'].slice(0, -5);

	return my['result'];
}

function addParenthesis(searchText) {
	let needParenthesis = false;
	let searchTextParenthesis = '';
	const result = searchText.split(' and ');
	for (let i = 0; i < result.length; i++) {
		if (result[i].includes(' or ') && !result[i].includes('(')) needParenthesis = true;
		else if (result[i].toLowerCase().includes(' adj1 ') && !result[i].includes('(')) needParenthesis = true;
		else needParenthesis = false;
		if (needParenthesis) {
			searchTextParenthesis += `(${result[i]}) and `;
		} else {
			searchTextParenthesis += `${result[i]} and `;
		}
	}
	if (searchTextParenthesis.endsWith(' and ')) searchTextParenthesis = searchTextParenthesis.slice(0, -5);
	return searchTextParenthesis;
}

// 텍스트 and 인식 and 이미지 or 모듈 and 모듈 ADJ1 정보
// 텍스트 and 인식 and (이미지 or 모듈) and 모듈 ADJ1 정보
