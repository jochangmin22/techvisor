import React, { useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from '../../store/actions';

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

function addSeparator(val, separator, p1, p2) {
	return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
}

function Grade(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();
	// const rightfullOrder = useSelector(({ searchApp }) => searchApp.search.rightfullOrder);
	const rightHolder = useSelector(({ searchApp }) => searchApp.search.rightHolder);
	const registerFee = useSelector(({ searchApp }) => searchApp.search.registerFee);

	useEffect(() => {
		// dispatch(Actions.getRightfullOrder(props.appNo));
		if (props.search && props.search.등록번호 !== undefined) {
			dispatch(Actions.getRegisterFee(props.search.등록번호));
		}
		// eslint-disable-next-line
	}, [props.search]);

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
					</div>
				</Paper>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						<h6 className="font-600 text-14 p-16" color="secondary">
							기타 주요 사항
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>권리변동 사항</h6>
						<div className="table-responsive px-16">
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<thead>
									<tr>
										<th>번호</th>
										<th>변경내용</th>
										<th>변경일자</th>
										<th>권리자</th>
										<th>의무자</th>
									</tr>
								</thead>
								<tbody>
									{rightHolder &&
										rightHolder
											// .filter(legal => legal.법적상태명 === '연차료납부')
											.map((item, key) => (
												<tr key={key}>
													<td>{key + 1}</td>
													<td>{item.해당란}</td>
													<td>{addSeparator(item.등록일자, '.', 4, 6)}</td>
													<td>{item.권리자란}</td>
													<td className="max-w-360">{item.권리자구분}</td>
												</tr>
											))}
									{/* <tr>
										<td>1</td>
										<td>내용</td>
										<td>2015.01.02</td>
										<td>산전</td>
										<td>산전</td>
									</tr> */}
								</tbody>
							</table>
						</div>
					</div>
				</Paper>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>연차등록정보</h6>
						<div className="table-responsive px-16">
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<thead>
									<tr>
										<th>납입일</th>
										<th>납입년차</th>
										<th>납입금액</th>
										<th>감면사유</th>
										<th>반환사유</th>
										<th>반환금액</th>
										<th>반환일자</th>
									</tr>
								</thead>
								<tbody>
									{registerFee &&
										registerFee
											// .filter(registerFee => registerFee.법적상태명 === '연차료납부')
											.map((item, key) => (
												<tr key={key}>
													<td>{addSeparator(item.납부일자, '.', 4, 6)}</td>
													<td>
														{item.시작연차}-{item.마지막년차}
													</td>
													<td>{Number(item.등록료).toLocaleString()}</td>
													<td></td>
													<td></td>
													<td></td>
													<td></td>
												</tr>
											))}
									{/* <tr>
										<td>1</td>
										<td>내용</td>
										<td>2015.01.02</td>
										<td>산전</td>
										<td>산전</td>
										<td>산전</td>
										<td>산전</td>
										<td>2015.01.02</td>
									</tr> */}
								</tbody>
							</table>
						</div>
					</div>
				</Paper>
			</>
		</FuseAnimateGroup>
	);
}

export default Grade;
