import React, { useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	positiveBackground: { backgroundColor: theme.palette.primary.dark },
	negativeBackground: { backgroundColor: theme.palette.primary.light }
}));

function NewsArticles() {
	const classes = useStyles();
	// const { selectCode } = props;
	const theme = useTheme();
	const news = useSelector(({ companyApp }) => companyApp.searchs.news);
	const newsSA = useSelector(({ companyApp }) => companyApp.searchs.newsSA);

	const data = useMemo(() => news, [news]);
	const dataSA = useMemo(() => (newsSA === 0 || newsSA < 15 || newsSA > 85 ? 50 : newsSA), [newsSA]);

	const columns = useMemo(
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

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<div className="flex flex-col">
			<div className="px-12 flex items-center justify-between">
				<Typography className="p-12 text-14 font-bold">관련기사</Typography>
				<div className="items-center justify-center w-xs h-18 px-8">
					<div className="flex flex-row w-full h-full rounded-4 shadow">
						<div
							className={clsx(
								classes.positiveBackground,
								'h-full items-center justify-center text-center text-11 p-4 text-white'
							)}
							style={{
								width: `${dataSA}%`,
								transition: 'all .2s ease-out'
							}}
						>
							긍정 {dataSA.toFixed(1)}%
						</div>
						<div
							className={clsx(
								classes.negativeBackground,
								'h-full items-center justify-center text-center text-11 p-4 text-white'
							)}
							style={{
								width: `${100 - dataSA}%`,
								transition: 'all .2s ease-out'
							}}
						>
							부정 {(100 - dataSA).toFixed(1)}%
						</div>
					</div>
				</div>
			</div>
			<FuseScrollbars className="max-h-320 px-8">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					pageSize={8}
					pageOptions={[8, 16, 24]}
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
