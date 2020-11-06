import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
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
			color: theme.palette.text.primary,
			fontWeight: 500
		}
	},
	primaryColor: {
		color: theme.palette.text.primary
	}
}));

function AssociateCompany(props) {
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
							기업 매칭 결과
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>기업매칭결과</h6>
						<div className="table-responsive px-16">
							<Typography className="text-right text-12 pb-16">
								** 본 기술과의 업종 분류 키워드가 일치하는 기업정보를 표시합니다.
							</Typography>
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<thead>
									<tr>
										<th>구분</th>
										<th>기업명</th>
										<th>업종</th>
										<th>소재지</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>1</td>
										<td>산전</td>
										<td>제조,생산</td>
										<td>서울</td>
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

// export default withReducer("abroadApp", reducer)(AssociateCompany);
export default AssociateCompany;
