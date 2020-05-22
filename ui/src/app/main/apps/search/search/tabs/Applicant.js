import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from '../../store/actions';
import ApplicantTrend from './ApplicantTrend';
import ApplicantIpc from './ApplicantIpc';
import CircularLoading from '../../components/CircularLoading';

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

function Applicant(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();
	const applicant = useSelector(({ searchApp }) => searchApp.search.applicant);
	const applicantTrend = useSelector(({ searchApp }) => searchApp.search.applicantTrend);
	const [showLoading, setShowLoading] = useState(false);
	useEffect(() => {
		setShowLoading(true);
		dispatch(Actions.getApplicantTrend(props.search.출원인코드1));
		dispatch(Actions.getApplicant(props.search.출원인코드1)).then(() => {
			setShowLoading(false);
		});
	}, [dispatch, props.search.출원인코드1]);

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
							출원인 정보
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>출원인 정보</h6>
						<div className="table-responsive px-16">
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<tbody>
									<tr>
										<th>출원인명</th>
										<td>{props.search.출원인1}</td>
									</tr>
									<tr>
										<th>출원인 주소</th>
										<td>2</td>
									</tr>
									<tr>
										<th>법인번호</th>
										<td>{applicant && applicant.corpNo}</td>
									</tr>
									<tr>
										<th>사업자번호</th>
										<td>{applicant && applicant.bizNo}</td>
									</tr>
									<tr>
										<th>설립일</th>
										<td>2</td>
									</tr>
									<tr>
										<th>대표자정보</th>
										<td>2</td>
									</tr>
									<tr>
										<th>주 업종코드</th>
										<td>4</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</Paper>
				<div className="w-full md:w-2/3 md:pr-8 items-center justify-center">
					{showLoading ? (
						<CircularLoading delay={15000} />
					) : (
						<ApplicantTrend applicantTrend={applicantTrend} />
					)}
				</div>
				<div className="w-full md:w-1/3 md:pl-8 items-center justify-center">
					{showLoading ? <CircularLoading delay={15000} /> : <ApplicantIpc applicantTrend={applicantTrend} />}
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default Applicant;
