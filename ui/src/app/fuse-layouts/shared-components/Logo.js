import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
	root: {
		'& .logo-icon': {
			width: 100, // 24,
			height: 32, // 24,
			transition: theme.transitions.create(['width', 'height'], {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		},
		'& .react-badge, & .logo-text': {
			transition: theme.transitions.create('opacity', {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		}
	},
	reactBadge: {
		backgroundColor: 'rgba(0,0,0,0.6)', //'#121212',
		color: '#61DAFB'
	}
}));

function Logo() {
	const classes = useStyles();

	return (
		<div className={clsx(classes.root, 'flex items-center')}>
			<Button component={Link} to="/landing" role="button">
				<img className="logo-icon" src="assets/images/logos/logo_ipgrim_shadow.svg" alt="logo" />
			</Button>
			{/* <img className="logo-icon" src="assets/images/logos/logo_ipgrim_shadow.svg" alt="logo" /> */}
			{/* <Typography className="text-16 mx-12 font-light logo-text" color="inherit">
				FUSE
			</Typography>
			<div className={clsx(classes.reactBadge, 'react-badge flex items-center py-4 px-8 rounded')}>
				<img
					className="react-logo"
					src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy51GV9Jm2u7rmsCe65wKzPTw5jtS38n2tVEGi0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L1GV9Jm2u7rmsCe65wKzPTw5jtS38n2tVEGiPSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiGV9Jm2u7rmsCe65wKzPTw5jtS38n2tVEGiDtbLgjH2m5c8emE66pjdExmgep47BAdKTrCJ7rmsCe65wKzPTw5jtS38n2tVEGiyeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
					alt="react"
					width="16"
				/>
				<span className="react-text text-12 mx-4">React</span>
			</div> */}
		</div>
	);
}

export default Logo;
