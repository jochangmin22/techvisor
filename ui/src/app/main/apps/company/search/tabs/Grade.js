import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
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
		fontWeight: 600,
		padding: 6
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

function Grade(props) {
	const classes = useStyles(props);
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
						<h5 className={classes.title}>유망성 평가</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					평가 등급
				</h6>
				<div className="widget flex w-full sm:w-1/2 p-12">{/* <Widget8 widget={widgets.widget8} /> */}</div>
				<AppBar position="static">
					<Toolbar variant="dense">
						<h5 className={classes.title}>기타 주요 사항</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					권리변동 사항
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>번호</TableCell>
								<TableCell className={classes.tableRow}>변경내용</TableCell>
								<TableCell className={classes.tableRow}>변경일자</TableCell>
								<TableCell className={classes.tableRow}>권리자</TableCell>
								<TableCell className={classes.tableRow}>의무자</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>
				<h6 className="font-600 text-12 p-16" color="secondary">
					연차등록정보
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>번호</TableCell>
								<TableCell className={classes.tableRow}>납입 년차</TableCell>
								<TableCell className={classes.tableRow}>납입금액</TableCell>
								<TableCell className={classes.tableRow}>납입일</TableCell>
								<TableCell className={classes.tableRow}>감면사유</TableCell>
								<TableCell className={classes.tableRow}>반환사유</TableCell>
								<TableCell className={classes.tableRow}>반환금액</TableCell>
								<TableCell className={classes.tableRow}>반환일자</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>
			</div>
		</FuseAnimateGroup>
	);
}

export default Grade;
