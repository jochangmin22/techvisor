import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from '../../store/actions';
import ApplicantTrend from './ApplicantTrend';
import ApplicantIpc from './ApplicantIpc';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function Applicant(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();
	const { 출원인코드1, 출원인1, 출원인주소1, 출원인국가코드1 } = props.search;

	const applicant = useSelector(({ searchApp }) => searchApp.search.applicant);
	const applicantTrend = useSelector(({ searchApp }) => searchApp.search.applicantTrend);
	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		setShowLoading(true);
		const params = { cusNo: 출원인코드1 };
		dispatch(Actions.getApplicantTrend(params));
		dispatch(Actions.getApplicant(params)).then(() => {
			setShowLoading(false);
		});
	}, [dispatch, 출원인코드1]);

	const applicantInfo = {
		출원인명: 출원인1 + ' (' + (/^\d+$/.test(출원인국가코드1) ? 'KR' : 출원인국가코드1) + ')',
		'출원인 주소': 출원인주소1,
		특허고객번호: 출원인코드1,
		법인번호: applicant ? applicant.corpNo : '',
		사업자번호: applicant ? applicant.bizNo : ''
		// 설립일: '',
		// 대표자정보: '',
		// '주 업종코드': ''
	};

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
						<Typography className="text-14 p-12 text-bold">출원인 정보</Typography>
						{Object.entries(applicantInfo)
							.filter(([key, value]) => value.length > 0)
							.map(([key, value]) => (
								<Grid container key={key} spacing={3}>
									<Grid item xs={4} md={2}>
										<div className={clsx(classes.primaryColor, 'p-4 md:p-8')}>{key}</div>
									</Grid>
									<Grid item xs={8} md={10}>
										<div className="p-4 md:p-8">{value}</div>
									</Grid>
								</Grid>
							))}
					</div>
				</Paper>
				<div className="w-full md:w-2/3 md:pr-8 items-center justify-center">
					{showLoading ? <SpinLoading delay={15000} /> : <ApplicantTrend applicantTrend={applicantTrend} />}
				</div>
				<div className="w-full md:w-1/3 md:pl-8 items-center justify-center">
					{showLoading ? <SpinLoading delay={15000} /> : <ApplicantIpc applicantTrend={applicantTrend} />}
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default Applicant;
