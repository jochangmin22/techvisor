import React from 'react';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import PropTypes from 'prop-types';

function desc(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

const headCells = [
	{ id: '등록사항', numeric: false, disablePadding: true, label: '등록사항' },
	{
		id: '발명의명칭(국문)',
		numeric: false,
		disablePadding: true,
		label: '발명의명칭(국문)'
	},
	{ id: '출원번호', numeric: false, disablePadding: true, label: '출원번호' },
	{ id: '출원일', numeric: false, disablePadding: true, label: '출원일자' }
];

function HeaderTableHead(props) {
	const { classes, onSelectAllClick, order, orderBy, numselected, rowCount, onRequestSort } = props;
	const createSortHandler = property => event => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell padding="checkbox">
					<Checkbox
						indeterminate={numselected > 0 && numselected < rowCount}
						checked={numselected === rowCount}
						onChange={onSelectAllClick}
						inputProps={{ 'area-label': '전체 건 선택' }}
					/>
				</TableCell>
				{headCells.map(headCell => (
					<TableCell
						key={headCell.id}
						// align={headCell.numeric ? "right" : "left"}
						align="center"
						padding={headCell.disablePadding ? 'none' : 'default'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={order}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<span className={classes.visuallyHidden}>
									{/* <span> */}
									{order === desc ? '오름차순 정렬' : '내림차순 정렬'}
								</span>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

HeaderTableHead.propTypes = {
	classes: PropTypes.object.isRequired,
	numselected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired
};

export default HeaderTableHead;
