import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Highlighter from 'react-highlight-words';
import clsx from 'clsx';
import Figures from './Figures';
import LegalStatus from './LegalStatus';
import Quotation from './Quotation';
import Family from './Family';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		// width: "100%",
		width: '780',
		margin: '0 auto'
	},
	paper: {
		// marginTop: theme.spacing(0),
		width: '100%',
		overflowX: 'auto'
		// marginBottom: theme.spacing(0)
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

function removeRedundunant(val) {
	return val ? val.replace(/, \(\)/gi, '').replace(/ \(\)/gi, '') : '';
}

function PatInfo(props) {
	const classes = useStyles(props);

	const mainClaim = props.search.청구항종류.indexOf('dok');

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
						{/* <Typography className="py-16 font-600">서지정보</Typography> */}
						<h6 className="font-600 text-14 p-16" color="secondary">
							서지정보
						</h6>
						<div className="table-responsive px-16">
							<table className={clsx(classes.table, 'w-full text-justify dense')}>
								<tbody>
									<tr className="type">
										<th>특허상태</th>
										<td>{props.search.등록사항}</td>
									</tr>

									<tr className="size">
										<th>IPC</th>
										<td>{props.search.ipc코드}</td>
									</tr>

									<tr className="location">
										<th>CPC</th>
										<td>{props.search.ipc코드}</td>
									</tr>

									<tr className="owner">
										<th>출원번호</th>
										<td>
											{addSeparator(props.search.출원번호, '-', 2, 6) +
												(props.search.출원일자
													? ' (' + addSeparator(props.search.출원일자, '.', 4, 6) + ')'
													: '')}
										</td>
									</tr>
									<tr className="owner">
										<th>등록번호</th>
										<td>
											{addSeparator(props.search.등록번호, '-', 2, 6) +
												(props.search.등록일자
													? ' (' + addSeparator(props.search.등록일자, '.', 4, 6) + ')'
													: '')}
										</td>
									</tr>
									<tr className="owner">
										<th>공개번호</th>
										<td>
											{addSeparator(props.search.공개번호, '-', 2, 6) +
												(props.search.공개일자
													? ' (' + addSeparator(props.search.공개일자, '.', 4, 6) + ')'
													: '')}
										</td>
									</tr>
									<tr className="owner">
										<th>공고번호</th>
										<td>
											{addSeparator(props.search.공고번호, '-', 2, 6) +
												(props.search.공고일자
													? ' (' + addSeparator(props.search.공고일자, '.', 4, 6) + ')'
													: '')}
										</td>
									</tr>
									<tr className="owner">
										<th>출원인</th>
										<td>
											{removeRedundunant(props.search.출원인1) +
												(props.search.출원인2
													? ', ' + removeRedundunant(props.search.출원인2)
													: '') +
												(props.search.출원인3
													? ', ' + removeRedundunant(props.search.출원인3)
													: '')}
										</td>
									</tr>
									<tr className="owner">
										<th>발명자</th>
										<td>{removeRedundunant(props.search.발명자)}</td>
										{/* <td>{props.search.발명자}</td> */}
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</Paper>
				<Paper className="w-full rounded-8 shadow mb-16">
					<div className="flex flex-col items-start p-12">
						<h6 className="font-600 text-14 p-16" color="secondary">
							기술 요지
						</h6>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>요약</h6>
						<Typography className="mb-16 px-16" component="p">
							{props.search.초록 && (
								<Highlighter
									searchWords={props.terms}
									autoEscape={true}
									textToHighlight={props.search.초록}
								/>
							)}
						</Typography>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>도면</h6>

						<div className="px-16 py-8">
							<Figures className="mx-16 my-8" appNo={props.search.출원번호} />
						</div>

						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>대표청구항</h6>
						<Typography className="mb-16 px-16" component="p">
							청구항{mainClaim + 1}항(대표청구항)
						</Typography>
						<Typography className="mb-16 px-16" component="p">
							{props.search.청구항들[mainClaim] && (
								<Highlighter
									className="whitespace-pre-line"
									searchWords={props.terms}
									autoEscape={false}
									textToHighlight={props.search.청구항들[mainClaim]}
								/>
							)}
						</Typography>
						{props.search.키워드 && (
							<>
								<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>키워드</h6>
								<Typography className="mb-16 px-16" component="p">
									{props.search.키워드 && (
										<Highlighter
											searchWords={props.terms}
											autoEscape={false}
											textToHighlight={props.search.키워드}
										/>
									)}
								</Typography>
							</>
						)}
					</div>
				</Paper>
				<LegalStatus appNo={props.search.출원번호} />
				<Quotation appNo={props.search.출원번호} />
				<Family search={props.search} />
			</>
		</FuseAnimateGroup>
	);
}

// export default withReducer("searchApp", reducer)(PatInfo);
export default PatInfo;
