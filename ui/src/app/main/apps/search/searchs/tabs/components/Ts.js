import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@material-ui/styles';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import _ from '@lodash';

const entities = [
	{ 출원인: '삼성전자', 피인용수: '22', CPP: '4.4', 전체: '4', PII: '1.1', TS: '5.50', PFS: '0.75' },
	{ 출원인: '엘지전자', 피인용수a: '30', CPP: '3', 전체: '4', PII: '0.75', TS: '7.50', PFS: '0.50' },
	{ 출원인: '구글 엘엘씨', 피인용수: '27', CPP: '9', 전체: '4', PII: '2.25', TS: '6.75', PFS: '3.13' },
	{ 출원인: '에스케이플래닛 주식회사', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.94' },
	{ 출원인: '한국전자통신연구원', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' },
	{ 출원인: '마이크로소프트 코포레이션', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' }
];

function Cpp(props) {
	const theme = useTheme();
	const initialState = {
		title: '연도별 출원건수',
		ranges: {
			CPP: '지표분석 종합',
			PII: '피인용도 지수 CPP'
			// TS: '기술력지수 TS',
			// PFS: '시장확보지수 PFS'
			// TCT: '기술순환주기(TCT)',
			// CRn: '집중률지수(CRn)',
			// HHI: '허핀달-허쉬만 지수(HHI)'
		},
		mainChart: {
			CPP: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						// label: "1Month",
						data: [320, 529, 667, 388, 590, 652, 822],
						fill: false,
						// lineTension: 0.2,
						backgroundColor: theme.palette.primary.light,
						borderColor: theme.palette.primary.main,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: theme.palette.primary.dark,
						pointBackgroundColor: theme.palette.secondary.dark,
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: theme.palette.primary.dark,
						pointHoverBorderColor: theme.palette.primary.light,
						pointHoverBorderWidth: 2,
						// pointRadius: 0,
						pointHitRadius: 10
					}
				]
			},
			PII: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						// label: "1Month",
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			TS: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			},
			PFS: {
				labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
				datasets: [
					{
						data: [220, 329, 467, 188, 690, 352, 722]
					}
				]
			}
		},
		supporting: {
			patPub: {
				label: '특허공개',
				count: {
					CPP: 54,
					PII: 48,
					TS: 46,
					PFS: 54
				},
				chart: {
					CPP: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PII: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					TS: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PFS: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					}
				}
			},
			patReg: {
				label: '특허등록',
				count: {
					CPP: 27,
					PII: 31,
					TS: 26,
					PFS: 24
				},
				chart: {
					CPP: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PII: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					TS: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PFS: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					}
				}
			},
			utilPub: {
				label: '실용공개',
				count: {
					CPP: 4,
					PII: 5,
					TS: 2,
					PFS: 2
				},
				chart: {
					CPP: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PII: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					TS: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PFS: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					}
				}
			},
			utilReg: {
				label: '실용등록',
				count: {
					CPP: 6,
					PII: 4,
					TS: 2,
					PFS: 1
				},
				chart: {
					CPP: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PII: {
						datasets: [
							{
								// label: "Created",
								data: [5, 8, 5, 6, 7, 8, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					TS: {
						datasets: [
							{
								// label: "Created",
								data: [6, 3, 7, 5, 5, 4, 7],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					},
					PFS: {
						datasets: [
							{
								// label: "Created",
								data: [3, 2, 1, 4, 8, 8, 4],
								fill: true,
								backgroundColor: theme.palette.primary.light,
								pointRadius: 0,
								pointHitRadius: 20,
								borderWidth: 0
							}
						],
						labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018']
					}
				}
			}
		}
	};

	const lineOptions = {
		spanGaps: false,
		legend: {
			display: false
		},
		maintainAspectRatio: false,
		elements: {
			point: {
				radius: 2,
				borderWidth: 1,
				hoverRadius: 2,
				hoverBorderWidth: 1
			},
			line: {
				tension: 0.4
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
					display: true,
					ticks: {
						autoSkip: true,
						stepSize: 1,
						beginAtZero: false
					},
					gridLines: {
						display: false
					}
				}
			],
			yAxes: [
				{
					display: true,
					ticks: {
						autoSkip: true,
						stepSize: 1,
						// min: 1,
						// max: 50,
						fontSize: 10
					},
					gridLines: {
						display: false
					}
				}
			]
		},
		tooltips: {
			mode: 'nearest',
			intersect: true
			// callbacks: graphicTooltips(graphicId)
		},
		plugins: { datalabels: { display: false } }
	};

	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const indicator = useSelector(({ searchApp }) => searchApp.searchs.indicator);

	const data = useMemo(() => entities, []);

	const [currentRange, setCurrentRange] = useState('CPP');

	const [filteredData, setFilteredData] = useState(initialState);

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
					CPP: {
						...filteredData.mainChart.CPP,
						labels: payload.labelsA,
						datasets: [
							{
								...filteredData.mainChart.CPP.datasets[0],
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
							CPP: payload.countB
						},
						chart: {
							...filteredData.supporting.patPub.chart,
							CPP: {
								...filteredData.supporting.patPub.chart.CPP,
								datasets: [
									{
										...filteredData.supporting.patPub.chart.CPP.datasets[0],
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
							CPP: payload.countD
						},
						chart: {
							...filteredData.supporting.patReg.chart,
							CPP: {
								...filteredData.supporting.patReg.chart.CPP,
								datasets: [
									{
										...filteredData.supporting.patReg.chart.CPP.datasets[0],
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
							CPP: payload.countC
						},
						chart: {
							...filteredData.supporting.utilPub.chart,
							CPP: {
								...filteredData.supporting.utilPub.chart.CPP,
								datasets: [
									{
										...filteredData.supporting.utilPub.chart.CPP.datasets[0],
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
							CPP: payload.countE
						},
						chart: {
							...filteredData.supporting.utilReg.chart,
							CPP: {
								...filteredData.supporting.utilReg.chart.CPP,
								datasets: [
									{
										...filteredData.supporting.utilReg.chart.CPP.datasets[0],
										data: payload.dataE
									}
								],
								labels: payload.labelsE
							}
						}
					}
				}
			};
			return updatedState;
		}

		if (searchs && searchs.length > 0) {
			setFilteredData(updateState(getStats(searchs)));
		}
		// eslint-disable-next-line
	}, [props.searchText, searchs]);

	if (!searchs || searchs.length === 0) {
		return <SpinLoading />;
	}

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full shadow-none">
			<div className="flex flex-col items-center justify-start px-16 py-8 border-b-1">
				<Typography className="text-14 text-bold" color="textPrimary">
					기술력지수(TS: Technology Strength)
				</Typography>
				<Typography variant="caption" color="textSecondary">
					기술력지수가 클수록 해당 국가(또는 연구주체)의 기술력이 높음을 의미함
				</Typography>
			</div>
			<div className="flex flex-col sm:flex sm:flex-row p-8 container">
				<div className="flex flex-1 flex-col w-full w-full">
					<Line
						data={{
							labels: filteredData.mainChart[currentRange].labels,
							datasets: filteredData.mainChart[currentRange].datasets
						}}
						options={lineOptions}
						height={180}
					/>
				</div>
			</div>
		</Paper>
	);
}

export default React.memo(Cpp);
