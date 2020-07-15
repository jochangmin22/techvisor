import React, { useEffect, useRef, useState } from 'react';
import 'echarts-wordcloud';
import echarts from 'echarts';
import debounce from 'lodash/debounce';
import randomColor from 'randomcolor';
import Paper from '@material-ui/core/Paper';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

function WordCloud(props) {
	const { entities } = props;
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	useEffect(() => {
		if (entities) {
			drawChart();
		}
		// eslint-disable-next-line
	}, [entities]);

	const drawChart = () => {
		if (!entities) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current);
		setEchart(myChart);

		const option = {
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			series: [
				{
					type: 'wordCloud',
					shape: 'pentagon',
					left: 'center',
					top: 'center',
					width: '100%',
					height: '100%',
					right: null,
					bottom: null,
					sizeRange: [15, 60],
					rotationRange: [0, 0],
					rotationStep: 90,
					gridSize: 8,
					drawOutOfBound: false,

					// Global text style
					textStyle: {
						normal: {
							fontFamily: 'Noto Sans KR',
							fontWeight: 'bold',
							// Color can be a callback function or a color string
							color: function () {
								return randomColor({
									luminosity: 'bright',
									hue: 'purple',
									format: 'rgb'
									// luminosity: "bright" // bright, light, dark or random
									// hue: "blue", // red, orange, yellow, green, blue, purple, pink, monochrome or random
								});
							}
						},
						emphasis: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},
					data: entities
				}
			]
		};

		myChart.setOption(option);

		// myChart.on('click', param => {
		// 	handleClick(param.name);
		// });
	};

	const handleResize = debounce(() => {
		if (echart) {
			echart.resize();
		}
	}, 500);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow-none">
			<div id="main" className="w-full h-360" ref={chartRef} />
		</Paper>
	);
}

export default WordCloud;
