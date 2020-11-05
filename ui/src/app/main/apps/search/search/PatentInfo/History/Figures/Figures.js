import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useRef } from 'react';
import InfoIcon from '@material-ui/icons/Info';
import FiguresDialog from '../FiguresDialog';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
		backgroundColor: theme.palette.background.paper
	},
	gridList: {
		flexWrap: 'nowrap',
		// Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
		transform: 'translateZ(0)'
	},
	title: {
		color: theme.palette.primary.light
	},
	titleBar: {
		background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
	}
}));

const tileData = [
	{
		author: 'photo',
		title: '대표 도면',
		img: 'http://kpat.kipris.or.kr/kpat/remoteFile.do?method=bigFrontDraw&applno='
	}
	// {
	// 	author: 'photo',
	// 	title: '도면 1',
	// 	img: 'assets/images/profile/a-walk-amongst-friends-small.jpg'
	// },
	// {
	// 	author: 'photo',
	// 	title: '도면 2',
	// 	img: 'assets/images/profile/braies-lake-small.jpg'
	// },
	// {
	// 	author: 'photo',
	// 	title: '도면 3',
	// 	img: 'assets/images/profile/fall-glow-small.jpg'
	// },
	// {
	// 	author: 'photo',
	// 	title: '도면 4',
	// 	img: 'assets/images/profile/first-snow-small.jpg'
	// }
];

function Figures() {
	const classes = useStyles();
	const appNo = useSelector(({ searchApp }) => searchApp.searchs.selectedAppNo);
	const [data] = useState(tileData);

	const openDialogRef = useRef();

	function handleOpenDialog() {
		openDialogRef.current.openDialog();
	}

	// useEffect(() => {
	// 	axios.get('/api/profile/photos-videos').then(res => {
	// 		setData(res.data);
	// 	});
	// }, []);

	// const [selectedValue, setSelectedValue] = React.useState(emails[1]);

	if (!data) {
		return null;
	}

	return (
		<div className="md:flex max-w-2xl">
			<div className={classes.root}>
				<GridList className={classes.gridList} spacing={8} cols={0}>
					{/* <GridList className={classes.gridList} cols={2.5}> */}
					{tileData.map(tile => (
						<GridListTile
							classes={{
								root: 'w-full',
								tile: 'rounded-8'
							}}
							key={tile.img}
						>
							<img
								className="w-200 h-200"
								src={tile.img + appNo}
								alt={tile.title}
								onClick={handleOpenDialog}
							/>
							<FiguresDialog src={tile.img + appNo} ref={openDialogRef} />
							<GridListTileBar
								title={tile.title}
								classes={{
									root: classes.titleBar,
									title: classes.title
								}}
								actionIcon={
									<IconButton aria-label={`star ${tile.title}`}>
										<InfoIcon className={classes.title} />
									</IconButton>
								}
							/>
						</GridListTile>
					))}
				</GridList>
			</div>
		</div>
	);
}

export default React.forwardRef(Figures);
