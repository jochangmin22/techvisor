import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/blue';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/core';
import PopoverContent from 'app/main/apps/lib/PopoverContent';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

// const rightNow = new Date();
// const today = rightNow.toISOString().slice(0, 10); //.replace(/-/g, '');

const content = (
	<>
		<Typography variant="body1" className="mb-4">
			선택한 회사의 적정주가를 분석합니다.
		</Typography>
		<Typography variant="body1" className="mb-4">
			적정가1
		</Typography>
		<Typography variant="caption" className="font-300">
			PER * EPS
		</Typography>
		<Typography variant="body1" className="my-4">
			적정가2
		</Typography>
		<Typography variant="caption" className="font-300">
			ROE * EPS
		</Typography>
		<Typography variant="body1" className="my-4">
			적정가3
		</Typography>
		<Typography variant="caption" className="font-300">
			EPS * 10
		</Typography>
		<Typography variant="body1" className="my-4">
			적정가4
		</Typography>
		<Typography variant="caption" className="font-300">
			s-lim
		</Typography>
		<Typography variant="body1" className="my-4">
			적정가5
		</Typography>
		<Typography variant="caption" className="font-300">
			당기순이익 * PER
		</Typography>
	</>
);

function StockFairValue(props) {
	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const companyInfo = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);

	const { 회사명: corpName, 종목코드: stockCode, FV1, FV2, FV3, FV4, FV5, FV, CV } = companyInfo;

	// const [data, setData] = useState(initialState);

	useEffect(() => {
		if (companyInfo && Object.keys(companyInfo).length > 0) {
			drawChart();
		}
		// eslint-disable-next-line
	}, [companyInfo]);

	const drawChart = () => {
		if (!companyInfo || Object.keys(companyInfo).length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current, 'blue');
		setEchart(myChart);

		const option = {
			xAxis: {
				type: 'category',
				data: ['적정가1', '적정가2', '적정가3', '적정가4', '적정가5', '적정가', '현재가']
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					data: [
						{ value: FV1, itemStyle: { normal: { color: theme.palette.primary.dark } } },
						{ value: FV2, itemStyle: { normal: { color: theme.palette.primary.main } } },
						{ value: FV3, itemStyle: { normal: { color: theme.palette.primary.light } } },
						{ value: FV4, itemStyle: { normal: { color: theme.palette.secondary.dark } } },
						{ value: FV5, itemStyle: { normal: { color: theme.palette.secondary.main } } },
						{ value: FV, itemStyle: { normal: { color: theme.palette.secondary.light } } },
						{ value: CV, itemStyle: { normal: { color: theme.palette.primary.dark } } }
					],
					type: 'bar',
					label: {
						show: true,
						position: 'inside'
					}
				}
			],
			toolbox: {
				feature: {
					dataView: {
						show: true,
						title: '표로 보기',
						lang: ['표로 보기', '닫기', '갱신'],
						readOnly: false
					},
					magicType: {
						show: true,
						title: { line: '선', bar: '바', stack: '누적 막대', tiled: '타일' },
						type: ['line', 'bar', 'stack', 'tiled']
					},
					restore: { show: true, title: '원래대로' },
					saveAsImage: {
						show: true,
						name: 'ipgrim 적정주가분석 차트',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			grid: [
				{
					bottom: 110
				}
			]
		};
		myChart.setOption(option);
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

	if (!companyInfo || Object.keys(companyInfo).length === 0) {
		return <SpinLoading />;
	}

	const isEmpty = !!(!companyInfo || Object.keys(companyInfo).length === 0);

	return (
		<Paper className="w-full h-full shadow-none">
			<div className="px-12 flex items-center justify-between">
				<div className="flex flex-row items-center p-8 pb-0">
					<PopoverContent content={content} title="적정주가분석" variant="h6" />
					<DraggableIcon />
					<Typography className="font-medium text-gray-600 ml-8" color="inherit">
						{corpName}
					</Typography>
					<span className="flex flex-row items-center mx-8">
						{stockCode && (
							<Typography className="text-13 mr-8 text-gray-500" color="inherit">
								종목코드 : {stockCode}
							</Typography>
						)}
					</span>
				</div>
			</div>
			{isEmpty ? (
				<div className="max-h-320">
					<EmptyMsg
						icon="wb_incandescent"
						msg="적정주가분석"
						text="먼저 검색목록에서 기업명을 선택해주세요"
					/>
				</div>
			) : (
				<div id="main" className="w-full h-360" ref={chartRef} />
			)}
		</Paper>
	);
}

export default StockFairValue;
