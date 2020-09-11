import React from 'react';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	chip: {
		margin: theme.spacing(0.5)
	}
}));

function RelatedKeyword(props) {
	const classes = useStyles(props);
	const { wordCloud } = props;

	return (
		<div className="px-16">
			{wordCloud.map(data => {
				return (
					<Chip
						key={data.name}
						// icon={icon}
						label={data.name}
						className={classes.chip}
					/>
				);
			})}
		</div>
	);
}

export default RelatedKeyword;
