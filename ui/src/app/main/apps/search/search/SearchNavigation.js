import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import StyledPagination from 'app/main/apps/lib/StyledPagination';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	root: {
		'& > *': {
			marginTop: theme.spacing(2)
		}
	}
}));

function SearchNavigation(props) {
	const classes = useStyles();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const tableOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions.tableOptions);
	const { totalPosts, pageIndex, pageSize } = tableOptions;
	const { appNo } = props;

	const [, setPage] = useState(pageIndex + 1);
	const totalPage = Math.ceil(totalPosts / pageSize);
	const handleChange = (event, value) => {
		setPage(value);
	};

	return (
		<div className="flex flex-col items-center justify-center p-8">
			<Typography className="text-14 font-500">검색결과 전체목록</Typography>
			<hr />
			<Typography className="text-14 font-400">출원번호</Typography>
			<hr />
			<ul>
				{entities.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((key, index) => {
					const bold = key.출원번호 === appNo ? 'font-bold' : 'font-light';
					return (
						<li key={index} className="leading-loose">
							<Link to={`/apps/searchPage/${key.출원번호}`} className={clsx(bold, 'cursor-pointer')}>
								{key.출원번호}
							</Link>
						</li>
					);
				})}
			</ul>
			<hr />
			<div className={classes.root}>
				<StyledPagination count={totalPage} page={1} size="small" onChange={handleChange} />
			</div>
		</div>
	);
}

export default SearchNavigation;
