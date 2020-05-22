import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress, Typography, Paper, Button } from '@material-ui/core';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@material-ui/styles';
import _ from '@lodash';

function AppNum(props) {
	const theme = useTheme();
	const initialState = {
		title: '연도별 출원건수',
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
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						// label: "1Month",
						data: [320, 529, 667, 388, 590, 652, 822],
						fill: false,
						// borderColor: "#5c84f1",
						borderColor: theme.palette.primary.main,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						// pointBorderColor: "rgba(75,192,192,1)",
						pointBorderColor: theme.palette.primary.dark,
						pointBackgroundColor: '#fff',
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						// pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBackgroundColor: theme.palette.primary.dark,
						pointHoverBorderColor: 'rgba(220,220,220,1)',
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 10
					}
				]
			},
			JP: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						// label: "1Month",
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			US: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			EU: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			PCT: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			ETC: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			options: {
				responsive: true,
				spanGaps: false,
				legend: {
					display: false
				},
				lineTension: 0.1,
				maintainAspectRatio: false,
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
				// layout: {
				//     padding: {
				//         top: 24,
				//         left: 16,
				//         right: 16,
				//         bottom: 16
				//     }
				// },
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
								stepSize: 1
								// min: 100,
								// max: 500
							}
						}
					]
				},
				tooltips: {
					mode: 'nearest',
					intersect: true
					// callbacks: graphicTooltips(graphicId)
				}
			}
		},
		supporting: {
			patPub: {
				label: '특허공개',
				count: {
					KR: 54,
					JP: 48,
					US: 46,
					EU: 54,
					PCT: 54,
					ETC: 34
				},
				chart: {
					KR: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								// backgroundColor: "#42BFF7",
								backgroundColor: theme.palette.primary.dark,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					JP: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					US: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					EU: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PCT: {
						datasets: [
							{
								// label: "Created",
								data: [5, 2, 8, 9, 5, 5, 2],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					ETC: {
						datasets: [
							{
								// label: "Created",
								data: [2, 3, 4, 2, 3, 4, 5],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					options: {
						legend: {
							display: false
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
			},
			patReg: {
				label: '특허등록',
				count: {
					KR: 27,
					JP: 31,
					US: 26,
					EU: 24,
					PCT: 15,
					ETC: 13
				},
				chart: {
					KR: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.dark,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					JP: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					US: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					EU: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PCT: {
						datasets: [
							{
								// label: "Created",
								data: [5, 2, 8, 9, 5, 5, 2],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					ETC: {
						datasets: [
							{
								// label: "Created",
								data: [2, 3, 4, 2, 3, 4, 5],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					options: {
						legend: {
							display: false
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
			},
			utilPub: {
				label: '실용공개',
				count: {
					KR: 4,
					JP: 5,
					US: 2,
					EU: 2,
					PCT: 1,
					ETC: 1
				},
				chart: {
					KR: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.dark,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					JP: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					US: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					EU: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PCT: {
						datasets: [
							{
								// label: "Created",
								data: [5, 2, 8, 9, 5, 5, 2],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					ETC: {
						datasets: [
							{
								// label: "Created",
								data: [2, 3, 4, 2, 3, 4, 5],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					options: {
						legend: {
							display: false
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
			},
			utilReg: {
				label: '실용등록',
				count: {
					KR: 6,
					JP: 4,
					US: 2,
					EU: 1,
					PCT: 1,
					ETC: 2
				},
				chart: {
					KR: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.dark,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					JP: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					US: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					EU: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PCT: {
						datasets: [
							{
								// label: "Created",
								data: [5, 2, 8, 9, 5, 5, 2],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					ETC: {
						datasets: [
							{
								// label: "Created",
								data: [2, 3, 4, 2, 3, 4, 5],
								fill: true,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					options: {
						legend: {
							display: false
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
			}
		}
	};

	const companies = useSelector(({ companyApp }) => companyApp.searchs.entities);

	const [currentRange, setCurrentRange] = useState('KR');

	const [filteredData, setFilteredData] = useState(initialState);

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	useEffect(() => {
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item.출원일자)
				// .groupBy("출원년")
				.groupBy(o => o.출원일자.slice(0, 4))
				.map((value, key) => ({ labels: key, data: value.length }))
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
			var b = _.chain(arr)
				.filter(item => !!item.공개일자)
				.filter(item => String(item.출원번호).startsWith('1'))
				.groupBy(o => o.공개일자.slice(0, 4))
				// .groupBy("공개년")
				.map((value, key) => ({ labels: key, data: value.length }))
				.reduce((re, { labels, data }) => {
					if (!re['labelsB']) re['labelsB'] = [];
					if (!re['dataB']) re['dataB'] = [];
					if (!re['countB']) re['countB'] = 0;
					re['labelsB'].push(labels);
					re['dataB'].push(data);
					re['countB'] += data;
					return re;
				}, {})
				.value();
			var c = _.chain(arr)
				.filter(item => !!item.공개일자)
				.filter(item => String(item.출원번호).startsWith('2'))
				.groupBy(o => o.공개일자.slice(0, 4))
				// .groupBy("공개년")
				.map((value, key) => ({ labels: key, data: value.length }))
				.reduce((re, { labels, data }) => {
					if (!re['labelsC']) re['labelsC'] = [];
					if (!re['dataC']) re['dataC'] = [];
					if (!re['countC']) re['countC'] = 0;
					re['labelsC'].push(labels);
					re['dataC'].push(data);
					re['countC'] += data;
					return re;
				}, {})
				.value();
			var d = _.chain(arr)
				.filter(item => !!item.등록일자)
				.filter(item => String(item.출원번호).startsWith('1'))
				.groupBy(o => o.등록일자.slice(0, 4))
				// .groupBy("등록년")
				.map((value, key) => ({ labels: key, data: value.length }))
				.reduce((re, { labels, data }) => {
					if (!re['labelsD']) re['labelsD'] = [];
					if (!re['dataD']) re['dataD'] = [];
					if (!re['countD']) re['countD'] = 0;
					re['labelsD'].push(labels);
					re['dataD'].push(data);
					re['countD'] += data;
					return re;
				}, {})
				.value();
			var e = _.chain(arr)
				.filter(item => !!item.등록일자)
				.filter(item => String(item.출원번호).startsWith('2'))
				.groupBy(o => o.등록일자.slice(0, 4))
				// .groupBy("등록년")
				.map((value, key) => ({ labels: key, data: value.length }))
				.reduce((re, { labels, data }) => {
					if (!re['labelsE']) re['labelsE'] = [];
					if (!re['dataE']) re['dataE'] = [];
					if (!re['countE']) re['countE'] = 0;
					re['labelsE'].push(labels);
					re['dataE'].push(data);
					re['countE'] += data;
					return re;
				}, {})
				.value();

			a = _.isEmpty(a) ? { labelsA: [], dataA: [] } : a;
			b = _.isEmpty(b) ? { countB: 0, labelsB: [], dataB: [] } : b;
			c = _.isEmpty(c) ? { countC: 0, labelsC: [], dataC: [] } : c;
			d = _.isEmpty(d) ? { countD: 0, labelsD: [], dataD: [] } : d;
			e = _.isEmpty(e) ? { countE: 0, labelsE: [], dataE: [] } : e;

			return _.assign(a, b, c, d, e);
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
				},
				supporting: {
					...filteredData.supporting,
					patPub: {
						...filteredData.supporting.patPub,
						count: {
							...filteredData.supporting.patPub.count,
							KR: payload.countB
						},
						chart: {
							...filteredData.supporting.patPub.chart,
							KR: {
								...filteredData.supporting.patPub.chart.KR,
								datasets: [
									{
										...filteredData.supporting.patPub.chart.KR.datasets[0],
										data: payload.dataB
									}
								],
								labels: payload.labelsB
							}
						}
					},
					patReg: {
						...filteredData.supporting.patReg,
						count: {
							...filteredData.supporting.patReg.count,
							KR: payload.countD
						},
						chart: {
							...filteredData.supporting.patReg.chart,
							KR: {
								...filteredData.supporting.patReg.chart.KR,
								datasets: [
									{
										...filteredData.supporting.patReg.chart.KR.datasets[0],
										data: payload.dataD
									}
								],
								labels: payload.labelsD
							}
						}
					},
					utilPub: {
						...filteredData.supporting.utilPub,
						count: {
							...filteredData.supporting.utilPub.count,
							KR: payload.countC
						},
						chart: {
							...filteredData.supporting.utilPub.chart,
							KR: {
								...filteredData.supporting.utilPub.chart.KR,
								datasets: [
									{
										...filteredData.supporting.utilPub.chart.KR.datasets[0],
										data: payload.dataC
									}
								],
								labels: payload.labelsC
							}
						}
					},
					utilReg: {
						...filteredData.supporting.utilReg,
						count: {
							...filteredData.supporting.utilReg.count,
							KR: payload.countE
						},
						chart: {
							...filteredData.supporting.utilReg.chart,
							KR: {
								...filteredData.supporting.utilReg.chart.KR,
								datasets: [
									{
										...filteredData.supporting.utilReg.chart.KR.datasets[0],
										data: payload.dataE
									}
								],
								labels: payload.labelsE
							}
						}
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
		if (companies && companies.length > 0) {
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
			<div className="flex flex-col sm:flex sm:flex-row p-8 container">
				{/* <div className="flex flex-row flex-wrap"> */}
				{/* <div className="w-full max-w-md md:w-2/3 p-8"> */}
				<div className="flex flex-1 flex-col w-full sm:2/3">
					{/* <div className="flex w-full sm:w-2/3 flex-col p-8"> */}
					<Line
						data={{
							labels: filteredData.mainChart[currentRange].labels,
							datasets: filteredData.mainChart[currentRange].datasets
						}}
						options={filteredData.mainChart.options}
						// height={128}
					/>
				</div>
				{/* <div className="flex w-full md:w-1/3 flex-wrap p-8"> */}
				{/* <div className="flex w-full sm:w-1/3 flex-col p-8 container"> */}
				<div className="flex flex-wrap w-full sm:w-1/3 pt-16">
					{Object.entries(filteredData.supporting).map(([key, item]) => {
						return (
							<div key={key} className="flex w-full sm:w-1/2 flex-col p-12">
								<Typography
									variant="body1"
									// className="text-15 whitespace-no-wrap"
									// color="textSecondary"
								>
									{item.label}
								</Typography>
								<Typography variant="h4">{item.count[currentRange]}</Typography>
								<div className="h-32 w-full">
									<Line
										data={{
											labels: item.chart[currentRange].labels,
											datasets: item.chart[currentRange].datasets
										}}
										options={item.chart.options}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Paper>
	);
}

export default React.memo(AppNum);
