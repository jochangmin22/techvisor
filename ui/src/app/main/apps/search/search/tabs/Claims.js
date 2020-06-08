import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import Highlighter from 'react-highlight-words';
import SelectionHighlighter from 'react-highlight-selection';
import SpecContext from './SpecContext';

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
	},
	dok: {
		color: theme.palette.primary.main
	},
	jong: {
		color: theme.palette.secondary.main
	},
	sak: {
		color: theme.palette.warning.dark
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
function Claims(props) {
	const classes = useStyles(props);
	const { 청구항들, 청구항종류 } = props.search;

	const [open, setOpen] = useState(allOpen);
	const [currentRange, setCurrentRange] = useState('전체 청구항');

	const cCount = new Map([...new Set(청구항종류)].map(x => [x, 청구항종류.filter(y => y === x).length]));

	let claimsCount = [];
	claimsCount['all'] = 청구항들.length ? 청구항들.length : 0;
	claimsCount['dok'] = cCount.get('dok') ? cCount.get('dok') : 0;
	claimsCount['jong'] = cCount.get('jong') ? cCount.get('jong') : 0;
	claimsCount['sak'] = cCount.get('sak') ? cCount.get('sak') : 0;
	claimsCount['mi'] = claimsCount['all'] - claimsCount['dok'] - claimsCount['jong'] - claimsCount['sak'];
	// const badgeColor = ['primary', 'primary', 'secondary', 'error', 'default'];
	// const claimsColor = ['default', 'primary', 'secondary', 'default', 'default'];

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
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<Paper className="w-full rounded-8 shadow mb-16">
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
					{청구항들.map((data, key) => (
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
												//   	searchWords={props.terms}
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
			</Paper>
		</FuseAnimateGroup>
	);
}

export default Claims;
