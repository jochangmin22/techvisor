import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useDispatch } from 'react-redux';
import { getRegisterFee, getRightHolder } from 'app/main/apps/search/store/searchSlice';
import { Typography } from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import RightHolder from '../RightHolder';
import RegisterFee from '../RegisterFee';

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function GradeContainer(props) {
	const classes = useStyles();
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
				<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
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
				</div>
				<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
					<div className="flex flex-col items-start p-12">
						<Typography className="text-14 px-16 py-8 font-bold" color="textSecondary">
							특허권자 란
						</Typography>
						{rgNo ? (
							<RightHolder />
						) : (
							<FuseAnimate delay={800}>
								<Typography variant="subtitle1" color="textSecondary" className="p-16 mb-48">
									등록 문헌에만 권리자정보 정보가 제공됩니다.
								</Typography>
							</FuseAnimate>
						)}
					</div>
				</div>
				<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
					<div className="flex flex-col items-start p-12">
						<Typography className="text-14 px-16 py-8 font-bold" color="textSecondary">
							연차등록정보
						</Typography>
						{rgNo ? (
							<RegisterFee />
						) : (
							<FuseAnimate delay={1000}>
								<Typography variant="subtitle1" color="textSecondary" className="p-16 mb-48">
									등록 문헌에만 연차등록정보가 제공됩니다.
								</Typography>
							</FuseAnimate>
						)}
					</div>
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default GradeContainer;
