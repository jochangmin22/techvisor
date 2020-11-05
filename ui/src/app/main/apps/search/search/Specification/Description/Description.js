import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Highlighter from 'react-highlight-words';
import { makeStyles } from '@material-ui/core/styles';
import SpecContext from '../SpecContext';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	paper: { background: theme.palette.background.paper },
	marked: {
		backgroundColor: '#80DEEA',
		fontWeight: 800
	}
}));

const TurnOffHightlight = true;

function Description() {
	const classes = useStyles();
	// const descPart = ['기술분야','배경기술','해결과제','해결수단','발명효과','도면설명','발명의실시예'];

	const search = useSelector(({ searchApp }) => searchApp.search.search);
	const descPart = useSelector(({ searchApp }) => searchApp.search.search.descPart);
	const terms = useSelector(({ searchApp }) => searchApp.searchs.searchParams.terms);
	const newTerms = [].concat(...terms.flatMap(x => x.toString().split(' ').join(',').split(',')));

	const descButtons = descPart ? ['전체'].concat(descPart) : null;

	const allClose = descPart ? descPart.reduce((acc, it) => ({ ...acc, [it]: false }), {}) : '';
	const allOpen = descPart ? descPart.reduce((acc, it) => ({ ...acc, [it]: true }), {}) : '';

	const [currentRange, setCurrentRange] = useState('전체');
	const [open, setOpen] = useState(allOpen);

	const { filtered, setFiltered } = useContext(SpecContext);

	function handleChangeRange(text) {
		setCurrentRange(text);
		if (text === '전체') {
			setOpen(allOpen);
		} else {
			setOpen({ ...allClose, [text]: true });
		}
	}

	if (descPart === undefined) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center p-16">
				<div className="max-w-512 text-center">
					<FuseAnimate animation="transition.expandIn" delay={100}>
						<Typography variant="h1" color="inherit" className="font-medium mb-16">
							Oops!
						</Typography>
					</FuseAnimate>

					<FuseAnimate delay={500}>
						<Typography variant="h5" color="textSecondary" className="mb-16">
							명세서 내용을 불러올 수 없습니다!
						</Typography>
					</FuseAnimate>

					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							명세서 내용을 표시하는 데에 문제가 생겼습니다. 관리자에게 해당 출원번호를 보고해주시면
							감사드리겠습니다.
						</Typography>
					</FuseAnimate>

					{/* <Link className="font-medium" to="/apps/dashboards/project">
						Report this problem
					</Link> */}
				</div>
			</div>
		);
	}

	return (
		<FuseAnimateGroup
			className="flex w-full h-full"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
				{descPart.length === 0 ? (
					<SpinLoading className="w-full h-xl" />
				) : (
					<div className="flex flex-col items-start p-12">
						<div className="items-center">
							{descButtons &&
								descButtons.map((text, key) => {
									return (
										<Button
											key={key}
											className="normal-case shadow-none px-16"
											onClick={() => handleChangeRange(text)}
											color={currentRange === text ? 'secondary' : 'default'}
											variant={currentRange === text ? 'contained' : 'text'}
										>
											{text}
											{/* {claimsCount[key] !== 0 && <div
			                            className={clsx(classes.badge, 'ml-8')}
		                            >
			                            {claimsCount[key]}
		                            </div>} */}
										</Button>
									);
								})}
						</div>
						{filtered && (
							<div className="flex items-center mt-24">
								{/* <IconButton
								disableRipple
								className="w-40 h-40 -mx-12 p-0 focus:bg-transparent hover:bg-transparent"
								onClick={ev => ev.preventDefault()}
							>
								<Icon className="text-16 arrow-icon" color="inherit">
									{open ? 'expand_less' : 'expand_more'}
								</Icon>
							</IconButton> */}
								<IconButton
									disableRipple
									className="w-40 h-40 mr-8 p-0"
									onClick={() => setFiltered('')}
								>
									<Icon size="small" color="primary">
										close
									</Icon>
								</IconButton>
								<Typography className="flex w-full">
									<span>Searching text for : </span>
									<span className={classes.marked}>{filtered}</span>
								</Typography>
							</div>
						)}
						{descPart &&
							descPart.map((item, key) =>
								search[item] ? (
									<Collapse in={open[descPart[key]]} className="w-full mb-28" key={key}>
										<h6 className="font-600 text-14 px-16 py-8">{item}</h6>
										<Typography className="text-14 px-16">
											{search[item]
												.split('\n')
												.filter(item => item.includes(filtered))
												.map((line, n) => {
													return (
														<span className="break-words" key={n}>
															{line && (
																<Highlighter
																	searchWords={
																		filtered
																			? [filtered]
																			: TurnOffHightlight
																			? []
																			: newTerms
																	}
																	autoEscape={true}
																	textToHighlight={line}
																/>
															)}
															<br />
														</span>
													);
												})}
										</Typography>
									</Collapse>
								) : (
									<div className="mb-14" key={key}>
										<h6 className="font-600 text-14 px-16 py-8">{item}</h6>
									</div>
								)
							)}
					</div>
				)}
			</div>
		</FuseAnimateGroup>
	);
}

export default Description;
