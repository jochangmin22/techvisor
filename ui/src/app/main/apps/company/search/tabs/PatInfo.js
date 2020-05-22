import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, AppBar, Toolbar } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Highlighter from 'react-highlight-words';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		// width: "100%",
		width: '780',
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
	console.log('TCL: PatInfo -> props', props);

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
						<h5 className={classes.title}>특허정보</h5>
					</Toolbar>
				</AppBar>
				<h6 className="font-600 text-12 p-16" color="secondary">
					출원 정보
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>IPC</TableCell>
								<TableCell className={classes.tableRow}>{props.company.ipc코드}</TableCell>
								<TableCell className={classes.tableRow}>특허상태</TableCell>
								<TableCell className={classes.tableRow}>{props.company.등록사항}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>출원인</TableCell>
								<TableCell className={classes.tableRow}>{props.company.출원인1}</TableCell>
								<TableCell className={classes.tableRow}>발명자</TableCell>
								<TableCell className={classes.tableRow}>{props.company.발명자1}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>출원번호</TableCell>
								<TableCell className={classes.tableRow}>{props.company.출원번호}</TableCell>
								<TableCell className={classes.tableRow}>출원일자</TableCell>
								<TableCell className={classes.tableRow}>{props.company.출원일자}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>공개번호</TableCell>
								<TableCell className={classes.tableRow}>{props.company.공개번호}</TableCell>
								<TableCell className={classes.tableRow}>공개일자</TableCell>
								<TableCell>{props.company.공개일자}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>공고번호</TableCell>
								<TableCell className={classes.tableRow}>{props.company.공고번호}</TableCell>
								<TableCell className={classes.tableRow}>공고일자</TableCell>
								<TableCell className={classes.tableRow}>{props.company.공고일자}</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>등록번호</TableCell>
								<TableCell className={classes.tableRow}>{props.company.등록번호}</TableCell>
								<TableCell className={classes.tableRow}>등록일자</TableCell>
								<TableCell className={classes.tableRow}>{props.company.등록일자}</TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>

				<h6 className="font-600 text-14 px-16 py-16" color="secondary">
					기술 요지
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed} scope="row">
									초록
								</TableCell>
								{/* // TODO : 초록 keyword 태그 정리 */}
								<TableCell className={classes.tableRow}>
									{props.company.초록 && (
										<Highlighter
											searchWords={props.searchText.split(' ')}
											autoEscape={true}
											textToHighlight={props.company.초록}
										/>
									)}
								</TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed} scope="row">
									문제점
								</TableCell>
								<TableCell></TableCell>
							</StyledTableRow>
							<StyledTableRow>
								<TableCell className={classes.tableRowFixed} scope="row">
									효과
								</TableCell>
								<TableCell></TableCell>
							</StyledTableRow>
						</TableBody>
					</Table>
				</Paper>

				<h6 className="font-600 text-14 px-16 py-16" color="secondary">
					기술 도면
				</h6>
				<Paper className={classes.paper}>
					<Table className={classes.table} size="small">
						<TableBody>
							<StyledTableRow>
								<TableCell className={classes.tableRow}>대표도면</TableCell>
								<TableCell></TableCell>
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
