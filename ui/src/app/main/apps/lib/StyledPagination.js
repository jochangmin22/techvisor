import React from 'react';
import { usePagination } from '@material-ui/lab/Pagination';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles({
	ul: {
		listStyle: 'none',
		padding: 0,
		margin: 0,
		display: 'flex'
	}
});

function StyledPagination() {
	const classes = useStyles();
	const { items } = usePagination({
		count: 10
	});

	return (
		<nav>
			<ul className={classes.ul}>
				{items.map(({ page, type, selected, ...item }, index) => {
					let children = null;

					if (type === 'start-ellipsis' || type === 'end-ellipsis') {
						children = '…';
					} else if (type === 'page') {
						children = (
							<IconButton
								style={{
									fontWeight: selected ? 'bold' : undefined
								}}
								{...item}
								size="small"
								className="text-xs"
							>
								{page}
							</IconButton>
						);
					} else {
						children = (
							<IconButton {...item} size="small" className="h-12 w-12 p-0">
								{type === 'previous' ? <Icon>chevron_left</Icon> : <Icon>chevron_right</Icon>}
							</IconButton>
						);
					}

					return <li key={index}>{children}</li>;
				})}
			</ul>
		</nav>
	);
}

export default StyledPagination;
