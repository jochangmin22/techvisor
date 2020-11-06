import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useSelector, useDispatch } from 'react-redux';
import { getApplicant, getApplicantTrend, getApplicantIpc } from 'app/main/apps/search/store/searchSlice';
import ApplicantPie from '../ApplicantPie';
import ApplicantLine from '../ApplicantLine';

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	primaryColor: {
		color: theme.palette.text.primary
	}
}));

function ApplicantContainer() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const search = useSelector(({ searchApp }) => searchApp.search.search);
	const { 출원인코드1, 출원인1, 출원인주소1, 출원인국가코드1 } = search;

	const applicant = useSelector(({ searchApp }) => searchApp.search.applicant);
	const entities = useSelector(({ searchApp }) => searchApp.search.applicantTrend);
	const ipc = useSelector(({ searchApp }) => searchApp.search.applicantIpc);

	useEffect(() => {
		const params = { cusNo: search.출원인코드1 };
		dispatch(getApplicantTrend(params));
		dispatch(getApplicantIpc(params));
		dispatch(getApplicant(params));
	}, [dispatch, search]);

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
				<div className={clsx(classes.paper, 'w-full h-192 rounded-8 shadow mb-16')}>
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
				</div>
				<div className="w-full h-400 md:w-2/3 md:pr-8 items-center justify-center">
					<ApplicantLine entities={entities} />
				</div>
				<div className="w-full h-400 md:w-1/3 md:pl-8 items-center justify-center">
					<ApplicantPie entities={ipc} />
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default ApplicantContainer;
