import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Typography, Paper, Button } from '@material-ui/core';
import { Polar } from 'react-chartjs-2';
import randomColor from 'randomcolor';
// import IpcSummary from "./IpcSummary";
import _ from '@lodash';

const initialState = {
	title: '기술분야별 동향',
	ranges: {
		KR: '한국',
		JP: '일본',
		US: '미국',
		EU: '유럽',
		PCT: 'PCT',
		ETC: '기타국가'
	},
	mainChart: {
		KR: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [11, 16, 7, 3, 14],
					backgroundColor: randomColor({
						count: 20,
						hue: 'blue'
					}),
					label: 'IPC 분류' // for legend
				}
			]
		},
		JP: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [5, 6, 10, 5, 9],
					label: 'IPC 분류' // for legend
				}
			]
		},
		US: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [13, 12, 3, 9, 2],
					label: 'IPC 분류' // for legend
				}
			]
		},
		EU: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [4, 7, 9, 13, 1],
					label: 'IPC 분류' // for legend
				}
			]
		},
		PCT: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [5, 12, 3, 7, 11],
					label: 'IPC 분류' // for legend
				}
			]
		},
		ETC: {
			labels: ['B62M', 'B62K', 'G06Q', 'H02P', 'B60L'],
			datasets: [
				{
					data: [7, 8, 17, 2, 3],
					label: 'IPC 분류' // for legend
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			spanGaps: false,
			legend: {
				display: true,
				position: 'right'
			},
			elements: {
				point: {
					radius: 2,
					borderWidth: 1,
					hoverRadius: 2,
					hoverBorderWidth: 1
				},
				line: {
					tension: 0
				}
			},
			layout: {
				padding: {
					top: 4,
					left: 4,
					right: 4,
					bottom: 4
				}
			},
			scales: {
				xAxes: [
					{
						display: false
					}
				],
				yAxes: [
					{
						display: false,
						ticks: {
							// min: 100,
							// max: 500
						}
					}
				]
			},
			legendCallback: chart => {
				const text = [];
				text.push('<table class="list-none w-full mt-16">');
				text.push('<tbody>');
				// eslint-disable-next-line
				for (let i = 0; i < _.first(chart.mainChart.KR.datasets[0]).data.length; i++) {
					console.log(chart);
					const meta = chart.chart.legend.legendItems[i];
					text.push('<tr>');
					text.push(`<td class="pr-8 pb-12"> ${meta.text}</td>`);
					text.push(
						`<td class="rounded-full inline-block align-middle pb-12" style="height: 12px; width: 12px; background-color: ${
							_.first(chart.data.datasets).backgroundColor[i]
						};"></td>`
					);
					text.push(
						`<td class="pl-8 font-bold pb-12"> ${_.first(chart.data.datasets).data[
							i
						].toLocaleString()}</td>`
					);
					text.push('</tr>');
				}
				text.push('</tbody>');
				text.push('</table>');
				return text.join('');
			}
		}
	}
};

function IpcPolar(props) {
	const companies = useSelector(({ companyApp }) => companyApp.searchs.entities);

	const [currentRange, setCurrentRange] = useState('KR');

	const [filteredData, setFilteredData] = useState(initialState);

	// const widget = _.merge({}, props.widget);

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	useEffect(() => {
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item.ipc요약)
				.groupBy('ipc요약')
				.map((value, key) => ({ labels: key, data: value.length }))
				.orderBy(['data'], ['desc'])
				.splice(0, 15)
				.reduce((re, { labels, data }) => {
					if (!re['labelsA']) re['labelsA'] = [];
					if (!re['dataA']) re['dataA'] = [];
					// if (!re["countA"]) re["countA"] = 0;
					re['labelsA'].push(labels);
					re['dataA'].push(data);
					// re["countA"] += data;
					return re;
				}, {})
				.value();

			a = _.isEmpty(a) ? { labelsA: [], dataA: [] } : a;

			return a;
		}

		function updateState(payload) {
			const updatedState = {
				...filteredData,
				mainChart: {
					...filteredData.mainChart,
					KR: {
						...filteredData.mainChart.KR,
						labels: payload.labelsA,
						datasets: [
							{
								...filteredData.mainChart.KR.datasets[0],
								data: payload.dataA
							}
						]
					}
				}
			};
			// console.log(payload);
			// console.log(updatedState);
			return updatedState;
		}

		// const samplePayload = {
		//     labels: ["2010", "2013", "2014", "2015", "2016", "2017", "2019"],
		//     data: ["2010", "2013", "2014", "2015", "2016", "2017", "2019"]
		// };
		if (companies) {
			setFilteredData(updateState(getStats(companies)));
		}
		// eslint-disable-next-line
	}, [props.searchText, companies]);

	return !companies || companies.length === 0 ? (
		<div className="flex flex-col flex-1 items-center justify-center min-w-320 min-h-288 lg:min-w-640">
			<Typography variant="h6" className="my-24" color="primary">
				Loading ...
			</Typography>
			<CircularProgress size={24} />
		</div>
	) : (
		// <div className="flex flex-col flex-1 items-center justify-center p-24">
		//     <Typography variant="h6" className="my-24">
		//         검색결과가 없습니다.
		//     </Typography>
		// </div>
		<Paper className="w-full shadow-none">
			<div className="flex items-center justify-between px-16 py-8 border-b-1">
				<Typography variant="body1" className="hidden sm:flex">
					{filteredData.title}
				</Typography>
				<div className="items-center">
					{Object.entries(filteredData.ranges).map(([key, n]) => {
						return (
							<Button
								key={key}
								size="small"
								className="normal-case shadow-none px-4 sm:px-0"
								onClick={() => handleChangeRange(key)}
								color={currentRange === key ? 'primary' : 'default'}
								variant={currentRange === key ? 'contained' : 'text'}
							>
								{n}
							</Button>
						);
					})}
				</div>
			</div>
			<div className="flex flex-row flex-wrap">
				{/* <div className="w-full md:w-1/2 p-8 min-h-400 h-400"> */}
				{/* <div className="min-w-sm w-sm p-8 min-h-400 h-400"> */}
				<div className="w-full">
					<Polar
						data={{
							labels: filteredData.mainChart[currentRange].labels,
							datasets: filteredData.mainChart[currentRange].datasets
						}}
						options={filteredData.mainChart.options}
						height={256}
					/>
				</div>
			</div>
		</Paper>
	);
}
export default IpcPolar;
