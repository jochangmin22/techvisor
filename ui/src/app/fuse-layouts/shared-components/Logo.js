import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import React from 'react';

const useStyles = makeStyles(theme => ({
	logoIcon: {
		width: 100,
		height: 32,
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

function Logo() {
	const classes = useStyles();

	return (
		<div className="flex items-center">
			<Link className="cursor-pointer" to="/landing" role="button">
				<img className={classes.logoIcon} src="assets/images/logos/logo_ipgrim_shadow.svg" alt="logo" />
			</Link>
		</div>
	);
}

export default Logo;
