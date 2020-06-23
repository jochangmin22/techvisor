import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Highlighter from 'react-highlight-words';
import clsx from 'clsx';
import Figures from './Figures';
import LegalStatus from './LegalStatus';
import Quotation from './Quotation';
import Family from './Family';

const useStyles = makeStyles(theme => ({
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

const TurnOffHightlight = true;

function addSeparator(val, separator, p1, p2) {
	return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
}

function removeRedundunant(val) {
	return val ? val.replace(/, \(\)/gi, '').replace(/ \(\)/gi, '') : '';
}

function PatInfo(props) {
	const classes = useStyles(props);

	const mainClaim = props.search.청구항종류.indexOf('dok');

	const bibloInfo = {
		특허상태: props.search.등록사항,
		IPC: props.search.ipc코드,
		CPC: props.search.ipc코드,
		출원번호: addSeparator(props.search.출원번호, '-', 2, 6) +
												(props.search.출원일자
													? ' (' + addSeparator(props.search.출원일자, '.', 4, 6) + ')'
													: ''),
		등록번호: addSeparator(props.search.등록번호, '-', 2, 6) +
												(props.search.등록일자
													? ' (' + addSeparator(props.search.등록일자, '.', 4, 6) + ')'
													: ''),
		공개번호: addSeparator(props.search.공개번호, '-', 2, 6) +
												(props.search.공개일자
													? ' (' + addSeparator(props.search.공개일자, '.', 4, 6) + ')'
													: ''),
		공고번호: addSeparator(props.search.공고번호, '-', 2, 6) +
												(props.search.공고일자
													? ' (' + addSeparator(props.search.공고일자, '.', 4, 6) + ')'
													: ''),
		출원인: removeRedundunant(props.search.출원인1) +
												(props.search.출원인2
													? ', ' + removeRedundunant(props.search.출원인2)
													: '') +
												(props.search.출원인3
													? ', ' + removeRedundunant(props.search.출원인3)
													: ''),
		발명자: removeRedundunant(props.search.발명자)
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
						<Typography className="p-12 text-14 font-bold">서지정보</Typography>
						{Object.entries(bibloInfo).map(([key, value]) => (
							<Grid container key={key} spacing={3}>
								<Grid item xs={4} md={2}>
									<div className={clsx(classes.primaryColor, "p-4 md:p-8")}>{key}</div>
								</Grid>
								<Grid item xs={8} md={10}>
									<div className="p-4 md:p-8">{value}</div>
								</Grid>
							</Grid>
						))}
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
									searchWords={TurnOffHightlight ? [] : props.terms}
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
									searchWords={TurnOffHightlight ? [] : props.terms}
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
											searchWords={TurnOffHightlight ? [] : props.terms}
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
