/* eslint-disable */
import React, { useContext, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import SubjectContext from '../SubjectContext';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		height: '68px',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function NewsArticles(props) {
	// const { searchNum, topic } = props;
	const classes = useStyles();
	const theme = useTheme();
	// const dispatch = useDispatch();
	const news = useSelector(({ searchApp }) => searchApp.searchs.news);

	const { setShowLoading } = useContext(SubjectContext);

	// const { newsData, setNewsData } = useState(news);

	const columns = React.useMemo(
		() => [
			{
				Header: '제목',
				accessor: 'title',
				Cell: row => (
					<span>
						<span
							style={{
								color: theme.palette.primary.main,
								transition: 'all .3s ease'
							}}
						>
							&#10625;
						</span>{' '}
						{row.value}
					</span>
				),
				className: 'text-15'
			}
		],
		[]
	);

	const data = React.useMemo(() => news, [news]);

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<div className="flex flex-col">
			<div className="p-12 pb-0 flex items-center">
				<Typography className="text-14 font-bold">관련기사</Typography>
			</div>
			<FuseScrollbars className="max-h-160">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					showHeader={false}
					onRowClick={(ev, row) => {
						if (row) {
							window.open(row.original.link, '_blank');
							// props.history.push(row.original.link);
							// dispatch(Actions.openEditContactDialog(row.original));
						}
					}}
				/>
			</FuseScrollbars>
		</div>
	);
}

export default NewsArticles;
