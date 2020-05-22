/**
 *
 * @param {*} params
 * @param {*} inputSearchText needs to be updated ? searchTextParenthesis : null
 * 1. mistype handle, convert and or -> ; +
 * 2. convert to SearchText with Parenthesis
 * 3. update params value for UI
 * 4. create api parameters
 * example :
 * A (B C)      -> A AND (B OR C)
 * A and (B C)  -> "
 * A B C        -> A AND B AND C
 * A and B      -> A AND B
 * A or B       -> A OR B
 * A or B and C -> (A OR B) AND C
 * A and B or C -> A AND (B OR C)
 */

export default function parseSearchText(params, inputSearchText) {
	// handle parse searchtext depending on inputSearchText is null or not
	if (inputSearchText) {
		// from SearchHeader
		/**
		 * mistype handle,  ;+ convert
		 */
		const searchText = splitArgs(
			inputSearchText
				.toString()
				// .toLowerCase()
				.replace(/  +/g, ' ') // replace multiple spaces to single space
		);

		/**
		 *  convert searchText to searchTextParenthesis with parenthesis
		 */
		let searchTextParenthesis = addParenthesis(searchText);
		/**
		 * update params value for UI
		 */
		let { ...newParams } = {};
		// newParams.searchText = searchTextParenthesis;
		newParams.searchText = inputSearchText;

		let paramDate = searchText.split(' and ').filter(function (item) {
			if (/(?<=\(@)/gi.test(item)) {
				return true;
			}
			return false;
		})[0];

		if (paramDate !== undefined) {
			let result = '';
			if (/(?<=\(@)(.*?)(?=>)/gi.test(paramDate)) {
				result = paramDate.match(/(?<=\(@)(.*?)(?=>)/gi)[0];
			} else if (/(?<=\(@)(.*?)(?=<)/gi.test(paramDate)) {
				result = paramDate.match(/(?<=\(@)(.*?)(?=<)/gi)[0];
			}

			const dNumber = paramDate.replace(/\D/g, '');
			const dOperator = paramDate.replace(/[0-9]/g, '').replace(/@PRD|@AD|@PD|@FD/gi, '');
			if (dNumber) {
				if (dNumber.length === 8) {
					// >=A<=B, >=A, <=B, =A
					if (dOperator === '>=' || dOperator === '>' || dOperator === '=') {
						newParams.foundedStartDate = dNumber;
					} else {
						newParams.foundedEndDate = dNumber;
					}
				}
				if (dNumber.length === 16) {
					newParams.foundedStartDate = dNumber.slice(0, 8);
					newParams.foundedEndDate = dNumber.slice(8, 16);
				}
			}
		} else {
			// newParams.startDate = '';
			// newParams.endDate = '';
		}

		/**
		 * create api parameters
		 */
		const { ...newApiParams } = newParams;

		newApiParams.searchText = inputSearchText;
		// newApiParams.searchText = searchTextParenthesis;
		// newApiParams.companyName = newParams.companyName.join('+') | '';
		// newApiParams.companyAddress = newParams.companyAddress.join('+') | '';
		// newApiParams.bizDomain = newParams.bizDomain.join('+') | '';
		// newApiParams.relatedKeyword = newParams.relatedKeyword.join('+') | '';
		// newApiParams.customCriteria = newParams.customCriteria.join('+') | '';
		// newApiParams.industry = newParams.industry.join('+') | '';
		// newApiParams.marketCapStart = newParams.marketCapStart.join('+') | '';
		// newApiParams.marketCapStartEnd = newParams.marketCapStartEnd.join('+') | '';
		// newApiParams.foundedStartDate = newParams.foundedStartDate.join('+') | '';
		// newApiParams.foundedEndDate = newParams.foundedEndDate.join('+') | '';
		// newApiParams.employeeStart = newParams.employeeStart.join('+') | '';
		// newApiParams.employeeEnd = newParams.employeeEnd.join('+') | '';
		// newApiParams.repAgeStart = newParams.repAgeStart.join('+') | '';
		// newApiParams.repAgeEnd = newParams.repAgeEnd.join('+') | '';

		return [newParams, newApiParams];
	} else {
		// from LeftSiderTerms
		/**
		 * mistype handle,  ;+ convert
		 */
		const searchText = mergeArgs(params);

		/**
		 * make Terms array
		 */

		// a and b and c and @ad>=d<=e and (f OR g).ap and (h).inv -> newTerms = [a,b,c]
		// const newTerms = params.terms;

		/**
		 *  convert searchText to searchTextParenthesis with parenthesis
		 */
		// let searchTextParenthesis = addParenthesis(searchText);
		let searchTextParenthesis = inputSearchText;
		/**
		 * update params value for UI
		 */
		let { ...newParams } = params;
		newParams.searchText = searchTextParenthesis;
		// newParams.terms = newTerms;
		/**
		 * create api parameters
		 */
		const { ...newApiParams } = params; // terms not use at api params

		// newApiParams.searchText = searchTextParenthesis;
		// newApiParams.inventor = params.inventor.join(' or ');
		// newApiParams.assignee = params.assignee.join(' or ');
		// newApiParams.patentOffice = params.patentOffice.join(' or ');
		// newApiParams.language = params.language.join(' or ');
		// newApiParams.status = params.status.join(' or ');
		// newApiParams.ipType = params.ipType.join(' or ');

		return [newParams, newApiParams];
	}
}

function splitArgs(myString) {
	/**                    step 1            step 2            step 3
	 * A (B C)          -> [A,B C]        -> A;B_C          -> A;B_C
	 * A and (B C)      -> [A,and,B C]    -> A;and;B_C      -> A;B_C
	 * A B C            -> [A,B,C]        -> A;B;C          -> A;B;C
	 * A and B          -> [A,and,B]      -> A;and;B        -> A;B
	 * A or B           -> [A,or,B]       -> A;or;B         -> A+B
	 * A or B and C     -> [A,or,B,and,C] -> A;or;B;and;C   -> A+B;C
	 * A and B or C     -> [A,and,B,or,C] -> A;and;B;or;C   -> A;B+C
	 * A & B | C        -> [A,&,B,|,C]    -> A;&;B;|;C      -> A;B+C
	 * A;B C            -> [A;B,C]        -> A;B;C          -> A;B;C
	 * (A+B);C          -> [A+B,;C]       -> A+B;;C         -> A+B;C
	 *
	 * After change AND or OR
	 * A AND (B OR C)   -> [A,AND,B OR C] -> A;AND;B_OR_C   -> A AND B OR C
	 * A AND B OR C     -> [A,AND,B,OR,C] -> A;AND;B;OR;C   ->
	 * (A OR B) AND C   -> [A OR B,AND,C] -> A_OR_B;AND;C   -> A OR B AND C
	 *
	 * A (B OR C)   -> [A,B OR C] -> A;B_OR_C   -> A B OR C
	 * A AND B OR C     -> [A,AND,B,OR,C] -> A;AND;B;OR;C   ->
	 * (A OR B) AND C   -> [A OR B,AND,C] -> A_OR_B;AND;C   -> A OR B AND C
	 *
	 * 단백질 and 추출물 and 정제 AND (@AD>=20010101<=20180101) AND (한국생명공학연구원 OR 한국 한의학 연구원).AP AND (김).INV
	 *
	 * A AND B AND C AND (@AD>=20160101<=20180101) AND (F OR G).AP AND (H).INV
	 *
	 * A AND B AND C AND (@AD>=D<=E) AND (F OR "G H").AP AND (I).INV
	 * -> step 0 : A AND B AND C AND "⁋@AD>=D<=E¶" AND "⁋F_OR_~G_H~¶.AP" AND "⁋I¶".INV
	 * -> step 1 : [A,AND,B,AND,C,AND,⁋@AD>=D<=E¶,AND,⁋F_OR_~G_H~¶.AP,AND,⁋H¶.INV]
	 * -> step 2 : [A;AND;B;AND;C;AND;⁋@AD>=D<=E¶;AND;⁋F_OR_~G_H~¶.AP;AND;⁋H¶.INV]
	 * -> step 3 : [A AND B AND C AND (@AD>=D<=E) AND (F OR "G H").AP AND (H).INV]
	 */
	// change Parenthesis of .AP.INV to ⁋ ¶, double quotes to ~ ; (F OR "G H").AP world -> "⁋F_OR_~G_H~¶.AP"
	// and change Parenthesis to quotes
	myString = myString
		.split(' and ')
		.map(item =>
			/@(.*?)|(.*?)\.AP|(.*?)\.INV|(.*?)\.CTRY|(.*?)\.LANG|(.*?)\.STAT|(.*?)\.TYPE/gi.test(item)
				? `"${item.replace(/\(/gi, '⁋').replace(/\)/gi, '¶').replace(/ /gi, '_').replace(/"/gi, '~')}"`
				: item
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
	const { terms, dateType, startDate, endDate, assignee, inventor, patentOffice, language, status, ipType } = params;
	// 단백질 and 추출물 and 정제 AND (@AD>=20010101<=20180101) AND (한국생명공학연구원 OR 한국 한의학 연구원).AP AND (김).INV
	let myResult = terms && terms.length > 0 ? terms.map(item => item.join(' or ')).join(' and ') + ' and ' : '';
	const myDateType = dateType && dateType.length > 0 ? '(@' + dateType : '(';
	let myDate = myDateType;
	myDate += startDate && startDate.length > 0 ? '>=' + startDate : '';
	myDate += endDate && endDate.length > 0 ? '<=' + endDate + ') and ' : ') and ';
	myDate = myDate === myDateType + ') and ' ? '' : myDate;

	let myAssignee =
		assignee && assignee.length > 0
			? '(' + assignee.map(item => (/\s/.test(item) ? '"' + item + '"' : item)).join(' or ') + ').AP and '
			: '';
	let myInventor =
		inventor && inventor.length > 0
			? '(' + inventor.map(item => (/\s/.test(item) ? '"' + item + '"' : item)).join(' or ') + ').INV and '
			: '';
	let myPatentOffice = patentOffice && patentOffice.length > 0 ? '(' + patentOffice.join(' or ') + ').CTRY and ' : '';
	let myLanguage = language && language.length > 0 ? '(' + language.join(' or ') + ').LANG and ' : '';
	let myStatus = status && status.length > 0 ? '(' + status.join(' or ') + ').STAT and ' : '';
	let myIpType = ipType && ipType.length > 0 ? '(' + ipType.join(' or ') + ').TYPE and ' : '';

	myResult += myDate + myAssignee + myInventor + myPatentOffice + myLanguage + myStatus + myIpType;

	if (myResult.endsWith(' and ')) myResult = myResult.slice(0, -5);

	return myResult;
}

function addParenthesis(searchText) {
	let needParenthesis = false;
	let searchTextParenthesis = '';
	const result = searchText.split(' and ');
	for (let i = 0; i < result.length; i++) {
		if (result[i].includes(' or ') && !result[i].includes('(')) needParenthesis = true;
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
