/* eslint-disable */
import React, { useContext, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import EnhancedTable from './components/EnhancedTable';
import SubjectContext from '../SubjectContext';
import { useSelector } from 'react-redux';
import CircularLoading from '../../components/CircularLoading';

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
	const news = useSelector(({ companyApp }) => companyApp.searchs.news);

	const { setShowLoading } = useContext(SubjectContext);

	// const { newsData, setNewsData } = useState(news);

	const columns = React.useMemo(
		() => [
			{
				Header: 'Name',
				columns: [
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
						className: 'text-14'
					}
				]
			}
		],
		[]
	);

	const data = React.useMemo(() => news, [news]);

	if (!data || data.length === 0) {
		return <CircularLoading delay={10000} />;
	}

	return (
		<div className="flex flex-col">
			<div className="p-12 pb-0 flex items-center">
				<Typography className="text-14 font-bold">관련기사</Typography>
			</div>
			{/* <Table columns={columns} data={data} size="small" /> */}
			<EnhancedTable
				columns={columns}
				data={data}
				size="small"
				onRowClick={(ev, row) => {
					if (row) {
						window.open(row.original.link, '_blank');
						// props.history.push(row.original.link);
						// dispatch(Actions.openEditContactDialog(row.original));
					}
				}}
			/>
		</div>
	);
}

export default NewsArticles;
