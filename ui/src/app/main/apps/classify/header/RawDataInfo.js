import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/styles';
import _ from '@lodash';
import clsx from 'clsx';

function RawDataInfo(props) {
	const theme = useTheme();

	const [filteredData, setFilteredData] = useState();

	useEffect(() => {
		function getStats(arr) {
			let a = _.chain(arr)
				.filter(item => !!item.ipc요약)
				.groupBy('ipc요약')
				.map((value, key) => ({ labels: key, data: value.length }))
				.orderBy(['data'], ['desc'])
				.splice(0, 3)
				.reduce((re, { labels, data }) => {
					if (!re.labels) re.labels = [];
					if (!re.data) re.data = [];
					// if (!re["count"]) re["count"] = 0;
					re.labels.push(labels);
					re.data.push(data);
					// re["count"] += data;
					return re;
				}, {})
				.value();

			a = _.isEmpty(a) ? { labels: [], data: [] } : a;

			return a;
		}

		// const samplePayload = {
		//     labels: ["B62M", "B60L", "B62K"],
		//     data: ["17", "5", "4"]
		// };
		if (props.data && props.data.length > 0) {
			setFilteredData(getStats(props.data));
			// setData(samplePayload);
			console.log(filteredData);
		}
	}, [props.data]);

	return !filteredData || filteredData.length === 0 ? (
		<div />
	) : (
		<Card className="w-full shadow-none border-1 bg-blue-100">
			<div className="flex flex-row flex-wrap items-end justify-center">
				{/* <div className="pr-16">
                    <Typography className="h3" color="textSecondary">
                        총 건수
                    </Typography>
                    <Typography className="text-56 font-300 leading-none mt-8">
                        {props.data.length}
                    </Typography>
                </div> */}
				<div className="text-center pt-12 pb-28">
					<Typography className="text-56 leading-none text-blue">
						{props.data.length.toLocaleString()}
					</Typography>
					<Typography className="text-16 text-gray-600">총 건수</Typography>
				</div>
				{/* <div className="py-4 text-16 flex flex-row items-center"> */}
				<div className="p-8 flex flex-row items-center justify-center">
					{filteredData.labels.map((label, index) => (
						<div key={label} className="px-16 flex flex-col items-center">
							<Typography className="h4 text-gray-600">{label}</Typography>
							<Typography className="h2 font-500 py-8 text-orange">
								{((filteredData.data[index] / props.data.length) * 100).toFixed(1)}%
							</Typography>

							<div className="flex flex-row items-center justify-center">
								<div className="h5 text-green">{filteredData.data[index].toLocaleString()} 건</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

export default React.memo(RawDataInfo);
