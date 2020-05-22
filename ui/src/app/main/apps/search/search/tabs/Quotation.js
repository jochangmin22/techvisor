import React from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
// import * as Actions from '../../store/actions';

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

function Quotation(props) {
	const classes = useStyles(props);
	// const dispatch = useDispatch();
	const quote = useSelector(({ searchApp }) => searchApp.search.quote);

	// useEffect(() => {
	// 	dispatch(Actions.getQuote(props.appNo));
	// }, [props.appNo]);

	return (
		<>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						인용도 분석
					</h6>
					<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>주요 인용 정보</h6>
					<div className="table-responsive px-16">
						<table className={clsx(classes.table, 'w-full text-justify dense')}>
							<tbody>
								<tr>
									<th className="w-208">총 피인용 수</th>
									<td>{quote && quote.length !== 0 && quote.length}</td>
								</tr>
								<tr>
									<th className="w-208">피인용 문헌의 논문, 외국특허 수</th>
									<td>
										{quote &&
											quote.length !== 0 &&
											quote.length -
												quote.filter(item => item.표준인용문헌국가코드 !== 'KR').length}
									</td>
								</tr>
								<tr>
									<th className="w-208">국태 피인용 특허 수</th>
									<td>{quote && quote.length !== 0 && quote.length}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</Paper>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						인용/피인용 특허문헌 : 총 ({quote && quote.length !== 0 && quote.length}) 건
					</h6>
					{/* <h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>주요 인용 정보</h6> */}
					<div className="table-responsive px-16">
						<table className={clsx(classes.table, 'w-full text-justify dense')}>
							<thead>
								<tr>
									<th>식별코드</th>
									<th>국가</th>
									<th>문헌번호</th>
									<th>인용참증단계</th>
									<th>발명의 명칭</th>
									<th>출원인</th>
								</tr>
							</thead>
							<tbody>
								{quote &&
									quote.map((quote, index) => (
										<tr key={index}>
											<td className="w-84">{quote.표준인용식별코드}</td>
											<td className="w-72">{quote.표준인용문헌국가코드}</td>
											<td className="max-w-256">{quote.원인용문헌번호}</td>
											<td className="w-136">{quote.인용문헌구분코드명}</td>
											<td className="max-w-320">{quote.명칭}</td>
											<td className="w-136">{quote.출원인}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			</Paper>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						인용도 맵
					</h6>
					{/* <h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>주요 인용 정보</h6>											 */}
				</div>
			</Paper>
		</>
	);
}

export default Quotation;
