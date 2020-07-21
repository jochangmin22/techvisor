import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, AppBar, Toolbar } from '@material-ui/core';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import { useDispatch  } from "react-redux";
// import withReducer from "app/store/withReducer";
// import * as Actions from "../../store/actions";
// import reducer from '../../store';
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
						<h5 className={classes.title}>유사특허 목록</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					관련 분야 다인용 선행문헌 정보
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>구분</TableCell>
								<TableCell className={classes.tableRow}>행정상태</TableCell>
								<TableCell className={classes.tableRow}>명칭</TableCell>
								<TableCell className={classes.tableRow}>출원번호</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>
			</div>
		</FuseAnimateGroup>
	);
}

// export default withReducer("CompanyApp", reducer)(PatInfo);
export default PatInfo;
