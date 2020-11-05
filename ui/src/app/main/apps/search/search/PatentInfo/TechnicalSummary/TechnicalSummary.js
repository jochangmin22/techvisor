import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Highlighter from 'react-highlight-words';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

const TurnOffHightlight = true;

function TechnicalSummary() {
	const classes = useStyles();
	const search = useSelector(({ searchApp }) => searchApp.search.search);
	const terms = useSelector(({ searchApp }) => searchApp.searchs.searchParams.terms);
	const newTerms = [].concat(...terms.flatMap(x => x.toString().split(' ').join(',').split(',')));

	const mainClaim = search && search.청구항종류 ? search.청구항종류.indexOf('dok') : 0;

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex flex-col items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					기술 요지
				</h6>
				<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>요약</h6>
				{search && (
					<Typography className="mb-16 px-16" component="p">
						{search.초록 && (
							<Highlighter
								searchWords={TurnOffHightlight ? [] : newTerms}
								autoEscape={true}
								textToHighlight={search.초록}
							/>
						)}
					</Typography>
				)}
				<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>대표청구항</h6>
				<Typography className="mb-16 px-16" component="p">
					청구항{mainClaim + 1}항 <span className="text-gray-500">(대표청구항)</span>
				</Typography>
				{search && (
					<Typography className="mb-16 px-16" component="p">
						{search.청구항들[mainClaim] && (
							<Highlighter
								className="whitespace-pre-line"
								searchWords={TurnOffHightlight ? [] : newTerms}
								autoEscape={false}
								textToHighlight={search.청구항들[mainClaim]}
							/>
						)}
					</Typography>
				)}
				{search && (
					<>
						<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>키워드</h6>
						<Typography className="mb-16 px-16" component="p">
							{search.키워드 && (
								<Highlighter
									searchWords={TurnOffHightlight ? [] : newTerms}
									autoEscape={false}
									textToHighlight={search.키워드}
								/>
							)}
						</Typography>
					</>
				)}
			</div>
		</Paper>
	);
}

export default TechnicalSummary;
