import React from 'react';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		width: '780',
		margin: '0 auto'
	},
	paper: {
		width: '100%',
		overflowX: 'auto'
	},
	tableRow: {
		fontSize: 11,
		fontWeight: 600
	},
	tableRowFixed: {
		width: '15%',
		fontSize: 11,
		fontWeight: 600
	},
	table: {
		'& th': {
			padding: '4px 0',
			color: theme.palette.primary.main,
			fontWeight: 500
		}
	},
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function Similar(props) {
	const classes = useStyles(props);

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						<h6 className="font-600 text-14 p-16" color="secondary">
							유사특허 목록
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>
							관련 분야 다인용 선행문헌 정보
						</h6>
						<div className="table-responsive px-16">
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<thead>
									<tr>
										<th>구분</th>
										<th>행정상태</th>
										<th>명칭</th>
										<th>출원번호</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>1</td>
										<td>2015.01.02</td>
										<td>Ldc의 입력 전류 정보를 이용한 ldc 제어 장치</td>
										<td>10-2017-101001011</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</Paper>
			</>
		</FuseAnimateGroup>
	);
}

export default Similar;
