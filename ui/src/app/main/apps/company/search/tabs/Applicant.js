import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, AppBar, Toolbar } from '@material-ui/core';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import { useDispatch, useSelector } from "react-redux";
// import withReducer from "app/store/withReducer";
// import * as Actions from "../../store/actions";
// import reducer from "../../store/reducers";
// import _ from "lodash";
// import clsx from "clsx";

import { withStyles, makeStyles } from '@material-ui/styles';

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
		width: '15%',
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

function PatInfo(props) {
	// const dispatch = useDispatch();
	// const company = useSelector(({ CompanyApp }) => companyApp.searchs.);

	const classes = useStyles(props);

	// useEffect(() => {
	//     dispatch(Actions.getSearch());
	//     // dispatch(Actions.getProjects());
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
						<h5 className={classes.title}>출원인정보</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					출원인 정보
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>출원인명</TableCell>
								<TableCell className={classes.tableRow}>B62M 6/45</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}></TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>출원인 주소</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}></TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>법인번호</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}>사업자번호</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>설립일</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}>대표자정보</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>주 업종코드</TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}></TableCell>
								<TableCell className={classes.tableRow}></TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>

				<h6 className="font-600 text-12 p-16" color="secondary">
					출원인 출원 동향
				</h6>
				<Paper className={classes.paper}></Paper>

				<h6 className="font-600 text-12 p-16" color="secondary">
					출원인 보유기술 비중
				</h6>
				<Paper className={classes.paper}></Paper>
			</div>
		</FuseAnimateGroup>
	);
}

// export default withReducer("CompanyApp", reducer)(PatInfo);
export default PatInfo;
