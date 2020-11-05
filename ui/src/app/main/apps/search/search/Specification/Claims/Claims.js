import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import Highlighter from 'react-highlight-words';
import SelectionHighlighter from 'react-highlight-selection';
import SpecContext from '../SpecContext';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	paper: {
		background: theme.palette.background.paper
	},
	badge: {
		padding: '0 7px',
		fontSize: 11,
		fontWeight: 600,
		height: 20,
		minWidth: 20,
		borderRadius: 20,
		display: 'flex',
		alignItems: 'center',
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText
	},
	highLighter: {
		backgroundColor: '#C6DAFB'
	}
}));

const claimTypes = { '전체 청구항': 'all', 독립항: 'dok', 종속항: 'jong', '삭제 청구항': 'sak', '미분류 청구항': 'mi' };
const allClose = { dok: false, jong: false, sak: false, mi: false };
const allOpen = { dok: true, jong: true, sak: true, mi: true };

// TODO : 버튼 작동
// TODO : SelectionHightlighter 초기화
function Claims() {
	const classes = useStyles();
	const 청구항들 = useSelector(({ searchApp }) => searchApp.search.search.청구항들);
	const 청구항종류 = useSelector(({ searchApp }) => searchApp.search.search.청구항종류);
	// const terms = useSelector(({ searchApp }) => searchApp.searchs.searchParams.terms);
	// const newTerms = [].concat(...terms.flatMap(x => x.toString().split(' ').join(',').split(',')));

	const [open, setOpen] = useState(allOpen);
	const [currentRange, setCurrentRange] = useState('전체 청구항');

	const cCount = new Map([...new Set(청구항종류)].map(x => [x, 청구항종류.filter(y => y === x).length]));

	let claimsCount = {};

	['dok', 'jong', 'sak'].map(key => (claimsCount[key] = cCount.get(key) ? cCount.get(key) : 0));

	claimsCount['all'] = 청구항들.length ? 청구항들.length : 0;
	claimsCount['mi'] = claimsCount['all'] - claimsCount['dok'] - claimsCount['jong'] - claimsCount['sak'];

	function handleChangeRange(text, key) {
		setCurrentRange(text);
		if (key === 'all') {
			setOpen(allOpen);
		} else {
			setOpen({ ...allClose, [key]: true });
		}
	}

	const { setFiltered } = useContext(SpecContext);
	function selectionHandler(value) {
		//do something with selection
		setFiltered(value.selection.trim());
	}

	return (
		<FuseAnimateGroup
			className="flex h-full w-full"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
				{청구항들.length === 0 ? (
					<SpinLoading className="w-full h-xl" />
				) : (
					<div className="flex flex-col items-start p-12">
						<div className="items-center">
							{Object.entries(claimTypes).map(([text, key]) => {
								return (
									<Button
										key={key}
										className="normal-case shadow-none px-16"
										onClick={() => handleChangeRange(text, key)}
										color={
											currentRange === text
												? 'secondary'
												: key === 'dok'
												? 'primary'
												: key === 'jong'
												? 'secondary'
												: 'default'
										}
										variant={currentRange === text ? 'contained' : 'text'}
									>
										{text}
										{claimsCount[key] !== 0 && (
											<div className={clsx(classes.badge, 'ml-8')}>{claimsCount[key]}</div>
										)}
									</Button>
								);
							})}
						</div>
						{청구항들 &&
							청구항종류 &&
							청구항들.map((data, key) => (
								<Collapse in={open[청구항종류[key]]} className="mb-28" key={key}>
									<h6 className={clsx(classes[청구항종류[key]], 'font-600 text-14 px-16 py-8')}>
										청구항 {key + 1}항 {청구항종류.indexOf('dok') === key && '(대표청구항)'}
									</h6>
									<Typography className="text-14 px-16">
										{data.split('\n').map((line, n) => {
											return (
												<span key={n}>
													{
														line && (
															<SelectionHighlighter
																text={line}
																selectionHandler={selectionHandler}
																customClass={classes.highLighter}
															/>
														)
														// <Highlighter
														//   	searchWords={newTerms}
														//    	autoEscape={true}
														//    	textToHighlight={line}
														// />
													}
													<br />
												</span>
											);
										})}
									</Typography>
								</Collapse>
							))}
					</div>
				)}
			</div>
		</FuseAnimateGroup>
	);
}

export default Claims;
