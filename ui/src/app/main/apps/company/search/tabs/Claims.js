import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, AppBar, Toolbar } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Highlighter from 'react-highlight-words';

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
		width: '25%',
		fontSize: 11,
		fontWeight: 600
	},
	tableRowClaim: {
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
	const classes = useStyles(props);

	const names = props.company.청구항들;

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
						<h5 className={classes.title}>청구항 분석</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					청구항 정보
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>독립항 수</TableCell>
								<TableCell className={classes.tableRow}>{props.company.독립항수}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>종속항 수</TableCell>
								<TableCell className={classes.tableRow}>{props.company.종속항수}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed}>최초 청구항 수</TableCell>
								<TableCell className={classes.tableRow}>{props.company.청구항수}</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>

					<Table className={classes.table} size="small">
						<TableCell>
							{/* {props.company.청구항들} */}
							{names.map((data, key) => {
								return (
									<StyledTableRow key={key}>
										<TableCell className={classes.tableRowClaim}>청구항 {key + 1}</TableCell>
										<TableCell className={classes.tableRow}>
											{data.split('\n').map(line => {
												return (
													<span>
														{line && (
															<Highlighter
																companyWords={props.companyText.split(' ')}
																autoEscape={true}
																textToHighlight={line}
															/>
														)}
														<br />
													</span>
												);
											})}
										</TableCell>
									</StyledTableRow>
								);
							})}
						</TableCell>
					</Table>
				</Paper>
				<h6 className="font-600 text-12 p-16" color="secondary">
					청구항 맵
				</h6>
				<div className="widget flex w-full sm:w-1/2 p-12">{/* <Widget8 widget={widgets.widget8} /> */}</div>
			</div>
		</FuseAnimateGroup>
	);
}

// export default withReducer("CompanyApp", reducer)(PatInfo);
export default PatInfo;
