import React, { useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useDispatch } from 'react-redux';
import { getRegisterFee, getRightHolder } from '../../store/searchSlice';
import { Typography } from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import GradeTableRightHolder from './components/GradeTableRightHolder';
import GradeTableRegisterFee from './components/GradeTableRegisterFee';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function Grade(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();

	const { rgNo } = props;

	useEffect(() => {
		if (rgNo) {
			const params = { rgNo: rgNo };
			dispatch(getRegisterFee(params));
			dispatch(getRightHolder(params));
		}
	}, [dispatch, rgNo]);

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
							유망성 평가
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>평가 등급</h6>
						<FuseAnimate delay={600}>
							<Typography variant="subtitle1" color="textSecondary" className="p-16 mb-48">
								평가 등급은 유효등록 문헌에만 제공됩니다.
							</Typography>
						</FuseAnimate>
					</div>
				</Paper>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						{/* <Typography className="text-14 p-16 font-bold">기타 주요 사항</Typography>*/}
						<Typography className="text-14 px-16 py-8 font-bold" color="textSecondary">
							특허권자 란
						</Typography>
						{rgNo ? (
							<GradeTableRightHolder />
						) : (
							<FuseAnimate delay={800}>
								<Typography variant="subtitle1" color="textSecondary" className="p-16 mb-48">
									등록 문헌에만 권리자정보 정보가 제공됩니다.
								</Typography>
							</FuseAnimate>
						)}
					</div>
				</Paper>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						<Typography className="text-14 px-16 py-8 font-bold" color="textSecondary">
							연차등록정보
						</Typography>
						{rgNo ? (
							<GradeTableRegisterFee />
						) : (
							<FuseAnimate delay={1000}>
								<Typography variant="subtitle1" color="textSecondary" className="p-16 mb-48">
									등록 문헌에만 연차등록정보가 제공됩니다.
								</Typography>
							</FuseAnimate>
						)}
					</div>
				</Paper>
			</>
		</FuseAnimateGroup>
	);
}

export default Grade;
