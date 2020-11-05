import React, { useRef, useEffect, useState } from 'react';
import echarts from 'echarts';
import debounce from 'lodash/debounce';
import _ from '@lodash';
import { useSelector } from 'react-redux';

function QuoteMap(props) {
	const chartRef = useRef(null);
	const appNo = useSelector(({ searchApp }) => searchApp.searchs.selectedAppNo);
	const 출원인1 = useSelector(({ searchApp }) => searchApp.search.search.출원인1);
	const [echart, setEchart] = useState(null);
	// const [series, setSeries] = useState(null);

	const bColor = '#00B050';
	const fColor = '#F45000';

	let data = [{ name: appNo + '\n' + 출원인1, x: 0, y: 0, itemStyle: { borderColor: '#3CB2EF' } }];
	let links = [];
	let bCnt = 0;
	let fCnt = 0;
	const chartHeight = props.data.length > 0 && props.data.length < 5 ? 'h-216' : 'h-512';

	props.data.map((v, i) => {
		const applicant = _.truncate(v.출원인, { length: 12 });
		if (v.식별코드 === 'B1') {
			data.push({ name: v.출원번호 + '\n' + applicant, x: -7, y: bCnt, itemStyle: { borderColor: bColor } });
			links.push({ source: 0, target: i + 1, lineStyle: { color: bColor } });
			bCnt++;
		} else {
			data.push({ name: v.출원번호 + '\n' + applicant, x: 7, y: fCnt, itemStyle: { borderColor: fColor } });
			links.push({ source: 0, target: i + 1, lineStyle: { color: fColor } });
			fCnt++;
		}
		return '';
	});

	useEffect(() => {
		drawChart();
		// updateChart();
		// eslint-disable-next-line
	}, []);

	// const updateChart = () => {
	// 	if (!echart || !series) {
	// 		return;
	// 	}

	// 	// const { data, currencyKey } = this.props;

	// 	// if (!entities.data) return;
	// 	console.log('updating..');

	// 	const { series, xAxis } = this;

	// 	// const dates = entities.data.map(info => new Date(info.get('date') * 1000)).toJS();
	// 	// dates.push(new Date(dates[dates.length - 1].getTime() + dates[1].getTime() - dates[0].getTime()));

	// 	// const candleStickData = entities.data
	// 	// 	.map(info => {
	// 	// 		return [
	// 	// 			info.get('open').toFixed(digits),
	// 	// 			info.get('close').toFixed(digits),
	// 	// 			info.get('low').toFixed(digits),
	// 	// 			info.get('high').toFixed(digits)
	// 	// 		];
	// 	// 	})
	// 	// 	.toJS();

	// 	// const volumes = entities.data.map(info => info.get('volume').toFixed(2)).toJS();

	// 	// xAxis[0].data = dates;
	// 	// xAxis[1].data = dates;
	// 	// series[0].data = candleStickData;
	// 	// series[1].data = calculateMA(entities.data, 5);
	// 	// series[2].data = calculateMA(entities.data, 15);
	// 	// series[3].data = calculateMA(entities.data, 50);
	// 	// series[4].data = volumes;

	// 	echart.setOption({
	// 		series,
	// 		xAxis
	// 	});
	// };

	const drawChart = () => {
		const myChart = echarts.init(chartRef.current);
		setEchart(myChart);

		const option = {
			tooltip: {},
			animation: false,
			// animationDurationUpdate: 1500,
			// animationEasingUpdate: 'quinticInOut',
			series: [
				{
					type: 'graph',
					// zoom: 0.5,
					// center: [7, 1],
					layout: 'none',
					symbolSize: [150, 50],
					symbolOffset: [0, 0],
					color: 'rgba(60, 178, 239, 1)',
					// disable zoom and pan
					roam: 'move', // false, move, scale, true
					// nodeScaleRatio: 0.6,
					symbol: 'rect',
					label: {
						show: true,
						color: '#000'
					},
					cursor: 'default',
					itemStyle: {
						color: 'rgba(255, 255, 255, 1)',
						borderWidth: 2,
						borderType: 'solid'
						// shadowBlur: 10,
						// shadowColor: 'rgba(0, 0, 0, 0.3)'
					},
					edgeSymbol: ['none', 'none'],
					edgeSymbolSize: [4, 10],
					edgeLabel: {
						fontSize: 20
					},
					data: data,
					links: links,
					lineStyle: {
						opacity: 1,
						width: 1,
						curveness: 0.2
					}
				}
			]
		};

		// setSeries(option.series);

		myChart.setOption(option);
	};

	const handleResize = debounce(() => {
		if (echart) {
			echart.resize();
		}
	}, 100);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	return <div id="main" className={chartHeight} ref={chartRef} />;
}

export default QuoteMap;
