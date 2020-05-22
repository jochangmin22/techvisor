import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import _ from '@lodash';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

// const renderSimpleBarChart = (
//       <BarChart width={150} height={40} data={trend}>
//         <Bar dataKey="uv" fill="#8884d8" />
//       </BarChart>
// );

function ApplicantTrend(props) {
	const { applicantTrend } = props;
	const [trend, setTrend] = useState(applicantTrend);

	useEffect(() => {
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item.출원년)
				.groupBy('출원년')
				.map((value, key) => ({ name: key, 출원: value.length }))
				.value();
			// var b = _.chain(arr)
			// 	.filter(item => !!item.공개년)
			// 	.groupBy('공개년')
			// 	.map((value, key) => ({ name: key, 공개: value.length }))
			// 	.value();
			// var c = _.chain(arr)
			// 	.filter(item => !!item.등록년)
			// 	.groupBy('등록년')
			// 	.map((value, key) => ({ name: key, 등록: value.length }))
			// 	.value();

			a = _.isEmpty(a) ? { name: '', 출원: '' } : a;
			// b = _.isEmpty(b) ? { name: '', 공개: '' } : b;
			// c = _.isEmpty(c) ? { name: '', 등록: '' } : c;
			// const d = _.merge(a, b, c);

			// var result = _(d)
			// 	.values() // extract the arrays from the object
			// 	.flatten() // flatten them to a single array
			// 	.groupBy('name') // group them by the ids
			// 	.map(function(values) {
			// 		// map the groups
			// 		return _.merge.apply(_, [{}].concat(values)); // merge all elements in the group. I'm using apply to merge the array of object, and add an empty object, so the original objects won't be mutated
			// 	})
			// 	.value(); // finish the chain

			return a;

			// return _.mergeWith(a, b, c);
		}

		if (applicantTrend && applicantTrend.length > 0) {
			setTrend(getStats(applicantTrend));
		}
	}, [applicantTrend]);

	const renderBarChart = (
		<BarChart data={trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
			<XAxis dataKey="name" stroke="#8884d8" />
			<YAxis />
			<Tooltip wrapperStyle={{ width: 100, backgroundColor: '#ccc' }} />
			<Legend
				width={100}
				wrapperStyle={{
					top: 40,
					left: 120,
					backgroundColor: '#f5f5f5',
					border: '1px solid #d5d5d5',
					borderRadius: 3,
					lineHeight: '40px'
				}}
			/>
			<CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
			<Bar type="monotone" dataKey="출원" fill="#0088FE" barSize={20} />
			{/* <Bar type="monotone" dataKey="공개" fill="#00C49F" barSize={20} />
		<Bar type="monotone" dataKey="등록" fill="#FFBB28" barSize={20} /> */}
		</BarChart>
	);

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex flex-col items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					출원인 출원 동향
				</h6>
				<ResponsiveContainer height={200} width="100%">
					{renderBarChart}
				</ResponsiveContainer>
			</div>
		</Paper>
	);
}

export default ApplicantTrend;
