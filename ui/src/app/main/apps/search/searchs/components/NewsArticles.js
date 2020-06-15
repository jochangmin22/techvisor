import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
// import SubjectContext from '../SubjectContext';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

function NewsArticles(props) {
	// const { searchNum, topic } = props;
	const theme = useTheme();
	// const dispatch = useDispatch();
	const news = useSelector(({ searchApp }) => searchApp.searchs.news);

	// const { setShowLoading } = useContext(SubjectContext);

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
		[theme.palette.primary.main]
	);

	const data = React.useMemo(() => news, [news]);

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<div className="flex flex-col">
			<Typography className="p-12 pb-0 text-14 font-bold">관련기사</Typography>
			<FuseScrollbars className="max-h-160">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					showHeader={false}
					onRowClick={(ev, row) => {
						if (row) {
							window.open(row.original.link, '_blank');
						}
					}}
				/>
			</FuseScrollbars>
		</div>
	);
}

export default NewsArticles;
