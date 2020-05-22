import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import _ from '@lodash';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function ApplicantIpc(props) {
	const { applicantTrend } = props;
	const [ipc, setIpc] = useState(applicantTrend);

	useEffect(() => {
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item.ipc요약)
				.groupBy('ipc요약')
				.map((value, key) => ({ name: key, value: value.length }))
				.orderBy(['value'], ['desc'])
				.splice(0, 15)
				.value();

			a = _.isEmpty(a) ? { name: '', value: '' } : a;

			return a;
		}
		if (applicantTrend && applicantTrend.length > 0) {
			setIpc(getStats(applicantTrend));
		}
	}, [applicantTrend]);

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

	const RADIAN = Math.PI / 180;
	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload, value, index }) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
				{payload.name}
				{/* {`${payload.name} ${(percent * 100).toFixed(0)}%`} */}
			</text>
		);
	};

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex flex-col items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					출원인 보유기술 비중
				</h6>
				<ResponsiveContainer height={200} width="100%">
					<PieChart width={400} height={250}>
						<Pie
							data={ipc}
							labelLine={false}
							label={renderCustomizedLabel}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
							isAnimationActive={false}
						>
							{ipc &&
								ipc.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
						</Pie>
						<Tooltip wrapperStyle={{ width: 100, backgroundColor: '#ccc' }} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</Paper>
	);
}

export default ApplicantIpc;
