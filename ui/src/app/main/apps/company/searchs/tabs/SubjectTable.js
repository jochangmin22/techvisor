import React from 'react';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Line } from 'rc-progress';

const useStyles = makeStyles(theme => ({
	word: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

// TODO : 클릭한 핵심 키워드 (Chip)도 표시
function SubjectTable(props) {
	const theme = useTheme();
	const classes = useStyles();
	function handleClick(item) {
		// props.history.push('/apps/e-commerce/orders/' + item.id);
	}

	return (
		<TableContainer className="max-h-224">
			<MuiTable stickyHeader size="small">
				<TableHead>
					<TableRow>
						<TableCell className="text-right">Surrounding word</TableCell>
						<TableCell className="text-right" colSpan={2}>
							Probability of occurrence
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{props.data.map(row => (
						<TableRow className="cursor-pointer" key={row.label} onClick={event => handleClick(row.label)}>
							<TableCell component="th" scope="row" align="right">
								<Typography
									className={clsx('inline text-11 font-500 px-8 py-4 rounded-4', classes.word)}
								>
									{row.label}
								</Typography>
							</TableCell>
							<TableCell component="th" scope="row" align="right">
								{row.value.toFixed(3)}
							</TableCell>
							<TableCell component="th" scope="row" align="right">
								<div className="w-72">
									<Line
										percent={[(row.value * 100).toFixed(0), 100 - (row.value * 100).toFixed(0)]}
										strokeWidth="8"
										strokeColor={[theme.palette.primary.main, theme.palette.primary.light]}
									/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</MuiTable>
		</TableContainer>
	);
}

export default React.memo(SubjectTable);
