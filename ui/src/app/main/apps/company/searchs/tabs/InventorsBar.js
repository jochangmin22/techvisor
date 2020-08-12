import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Typography, Paper, Button } from '@material-ui/core';
import { HorizontalBar, Doughnut } from 'react-chartjs-2';
// import randomColor from "randomcolor";
import _ from 'lodash';
import { useTheme } from '@material-ui/core/styles';

const nationality = {
	'01': '서울',
	'02': '부산',
	'03': '경기',
	'04': '강원',
	'05': '충북',
	'06': '충남',
	'07': '전북',
	'08': '전남',
	'09': '경북',
	'10': '경남',
	'11': '제주',
	'14': '대구',
	'15': '인천',
	'16': '광주',
	'17': '대전',
	'18': '한국',
	KR: '한국',
	US: '미국',
	JP: '일본',
	DE: '독일',
	FR: '프랑스',
	CA: '캐나다',
	NZ: '뉴질랜드',
	NL: '네덜란드',
	IT: '이탈리아',
	GB: '영국',
	IN: '인도',
	CH: '스위스',
	CN: '중국',
	BR: '브라질'
};

function InventorsBar(props) {
	const theme = useTheme();
	const initialState = {
		title: '발명자별 동향',
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
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						// lasbel: "fdfdf",
						data: [500, 400, 300, 200, 100, 50],
						borderWidth: 1,
						borderColor: theme.palette.primary.main,
						backgroundColor: theme.palette.primary.main,
						hoverBackgroundColor: theme.palette.primary.contrastText,
						hoverBorderColor: theme.palette.primary.contrastText
					}
				]
			},
			JP: {
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						data: [550, 450, 350, 250, 150, 50]
					}
				]
			},
			US: {
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						data: [580, 480, 380, 280, 180, 50]
					}
				]
			},
			EU: {
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						data: [590, 490, 390, 290, 190, 50]
					}
				]
			},
			PCT: {
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						data: [520, 420, 320, 220, 120, 50]
					}
				]
			},
			ETC: {
				labels: [
					'현대자동차주식회사',
					'기아자동차주식회사',
					'TOYOTA MOTOR',
					'주식회사 엘지화학',
					'쌍용자동차주식회사',
					'한온시스템 주식회사'
				],
				datasets: [
					{
						data: [600, 500, 400, 300, 200, 150]
					}
				]
			},
			options: {
				responsive: true,
				spanGaps: true,
				legend: {
					display: false
					// position: "right"
				},
				maintainAspectRatio: true,
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
							display: true
						}
					],
					yAxes: [
						{
							display: true,
							ticks: {
								// min: 100,
								// max: 500
							}
						}
					]
				}
			}
		},
		supporting: {
			title: '주소',
			KR: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100],
						borderColor: theme.palette.divider,
						backgroundColor: [
							theme.palette.primary.dark,
							theme.palette.primary.main,
							theme.palette.primary.light
						],
						hoverBackgroundColor: [
							theme.palette.secondary.dark,
							theme.palette.secondary.main,
							theme.palette.secondary.light
						]
						// backgroundColor: randomColor({
						//     count: 5,
						//     luminosity: "light",
						//     hue: "blue"
						//     // luminosity: "bright" // bright, light, dark or random
						//     // hue: "blue", // red, orange, yellow, green, blue, purple, pink, monochrome or random
						// })
					}
				]
			},
			JP: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100]
					}
				]
			},
			US: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100]
					}
				]
			},
			EU: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100]
					}
				]
			},
			PCT: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100]
					}
				]
			},
			ETC: {
				labels: ['Red', 'Green', 'Yellow'],
				datasets: [
					{
						data: [300, 50, 100]
					}
				]
			},
			options: {
				legend: {
					display: true,
					position: 'right'
				},
				maintainAspectRatio: false,
				scales: {
					xAxes: [
						{
							display: false
						}
					],
					yAxes: [
						{
							display: false
						}
					]
				}
			}
		}
	};
	const companies = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const [currentRange, setCurrentRange] = useState('KR');
	// const widget = _.merge({}, props.widget);

	const [filteredData, setFilteredData] = useState(initialState);

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	useEffect(() => {
		function natSwap(ref) {
			return Object.keys(nationality).includes(ref) ? nationality[ref] : ref;
		}
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item['발명자1'])
				.groupBy('발명자1')
				.map((value, key) => ({
					labels: key,
					data: value.length
				}))
				.orderBy(['data'], ['desc'])
				.slice(0, 20)
				.reduce((re, { labels, data }) => {
					if (!re['labelsA']) re['labelsA'] = [];
					if (!re['dataA']) re['dataA'] = [];
					re['labelsA'].push(labels);
					re['dataA'].push(data);
					return re;
				}, {})
				.value();

			// for 국적 Doughnut
			var b = _.chain(arr)
				.filter(item => !!item['발명자국가코드1'])
				.groupBy('발명자국가코드1')
				.map((value, key) => ({
					labels: natSwap(key),
					data: value.length
				}))
				.orderBy(['data'], ['desc'])
				.slice(0, 20)
				.reduce((re, { labels, data }) => {
					if (!re['labelsB']) re['labelsB'] = [];
					if (!re['dataB']) re['dataB'] = [];
					re['labelsB'].push(labels);
					re['dataB'].push(data);
					return re;
				}, {})
				.value();

			a = _.isEmpty(a) ? { labelsA: [], dataA: [] } : a;
			b = _.isEmpty(b) ? { labelsB: [], dataB: [] } : b;

			return _.assign(a, b);
		}

		function updateState(payload) {
			const updateState = {
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
				},
				supporting: {
					...filteredData.supporting,
					KR: {
						...filteredData.supporting.KR,
						labels: payload.labelsB,
						datasets: [
							{
								...filteredData.supporting.KR.datasets[0],
								data: payload.dataB
							}
						]
					}
				}
			};
			// console.log(payload);
			// console.log(updateState);

			return updateState;
		}

		if (companies) setFilteredData(updateState(getStats(companies)));
		// eslint-disable-next-line
	}, [props.searchText, companies]);

	// const Chart = require("react-chartjs-2").Chart;

	// var originalDoughnutDraw = Chart.controllers.doughnut.prototype.draw;
	// Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
	//     draw: function() {
	//         originalDoughnutDraw.apply(this, arguments);

	//         var chart = this.chart;
	//         var width = chart.chart.width,
	//             height = chart.chart.height,
	//             ctx = chart.chart.ctx;

	//         // var fontSize = (height / 114).toFixed(2);
	//         var fontSize = (height / 228).toFixed(2);
	//         ctx.font = fontSize + "em nosans-serif";
	//         ctx.textBaseline = "middle";

	//         // var sum = 0;
	//         // for (var i = 0; i < chart.config.data.datasets[0].data.length; i++) {
	//         //     sum += chart.config.data.datasets[0].data[i];
	//         // }

	//         var text = initialState.supporting.title,
	//             textX =
	//                 Math.round((width - ctx.measureText(text).width) / 2) - 45,
	//             textY = height / 2;

	//         ctx.fillText(text, textX, textY);
	//     }
	// });

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
				<div className="w-full md:w-1/2 p-8">
					<HorizontalBar
						data={{
							labels: filteredData.mainChart[currentRange].labels,
							datasets: filteredData.mainChart[currentRange].datasets
						}}
						options={filteredData.mainChart.options}
						height={240}
					/>
				</div>
				<div className="w-full md:w-1/2 flex-wrap p-8">
					<Doughnut
						data={{
							labels: filteredData.supporting[currentRange].labels,
							datasets: filteredData.supporting[currentRange].datasets
						}}
						options={filteredData.supporting.options}
						height={240}
					/>
				</div>
			</div>
		</Paper>
	);
}

export default React.memo(InventorsBar);
