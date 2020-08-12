import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, AppBar, Toolbar } from '@material-ui/core';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import { useDispatch, useSelector } from "react-redux";
// import withReducer from "app/store/withReducer";
// import * as Actions from "../../store/actions";
// import reducer from '../../store';
// import _ from "lodash";
import clsx from 'clsx';

import { withStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		width: '100%',
		margin: '0 auto'
	},
	content: {
		'& canvas': {
			maxHeight: '100%'
		}
	},
	selectedProject: {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		borderRadius: '8px 0 0 0'
	},
	projectMenuButton: {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		borderRadius: '0 8px 0 0',
		marginLeft: 1
	},
	tabRoot: {
		minWidth: 10
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
		width: '30%',
		fontSize: 11,
		fontWeight: 600
	}
}));

const StyledTableRow = withStyles(theme => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.background.default
		}
	}
}))(TableRow);

function Keyword(props) {
	// const dispatch = useDispatch();
	// const company = useSelector(({ CompanyApp }) => companyApp.searchs.);

	const classes = useStyles(props);

	// useEffect(() => {
	//     dispatch(getSearch());
	//     // dispatch(getProjects());
	// }, [dispatch]);

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<div className={classes.root}>
				<AppBar position="static">
					<Toolbar variant="dense">
						<h5 className={classes.title}>키워드 분석</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					키워드 정보
				</h6>
				<Paper className={clsx(classes.paper, 'mb-16')}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>독립 청구항 단어 수</TableCell>
								<TableCell className={classes.tableRow}>2</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>발명의 설명 단어 수</TableCell>
								<TableCell className={classes.tableRow}>5</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>종속항의 평균 단어 수</TableCell>
								<TableCell className={classes.tableRow}>7</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>초록 단어 수</TableCell>
								<TableCell className={classes.tableRow}>7</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>
				<h6 className="font-600 text-12 p-16" color="secondary">
					연관 키워드
				</h6>
				<Paper className={clsx(classes.paper, 'mb-16')}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>1</TableCell>
								<TableCell className={classes.tableRow}>2</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>2</TableCell>
								<TableCell className={classes.tableRow}>5</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>3</TableCell>
								<TableCell className={classes.tableRow}>7</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>4</TableCell>
								<TableCell className={classes.tableRow}>7</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>5</TableCell>
								<TableCell className={classes.tableRow}>7</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>
				<h6 className="font-600 text-12 p-16" color="secondary">
					워드 클라우드
				</h6>
				<div className="widget flex w-full sm:w-1/2 p-12">{/* <Widget8 widget={widgets.widget8} /> */}</div>
			</div>
		</FuseAnimateGroup>
	);
}

// export default withReducer("CompanyApp", reducer)(Keyword);
export default Keyword;
