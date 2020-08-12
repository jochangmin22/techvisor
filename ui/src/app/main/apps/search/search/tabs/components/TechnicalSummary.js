import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Highlighter from 'react-highlight-words';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

const TurnOffHightlight = true;

function TechnicalSummary(props) {
	const classes = useStyles(props);

	const mainClaim = props.search.청구항종류.indexOf('dok');

	return (
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
				<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>대표청구항</h6>
				<Typography className="mb-16 px-16" component="p">
					청구항{mainClaim + 1}항 <span className="text-gray-500">(대표청구항)</span>
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
	);
}

export default TechnicalSummary;
