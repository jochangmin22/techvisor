import React from 'react';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FuseAnimate from '@fuse/core/FuseAnimate';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useSelector } from 'react-redux';
import SummaryDictionary from './SummaryDictionary';

const useStyles = makeStyles(theme => ({
	listItem: {
		color: 'inherit!important',
		textDecoration: 'none!important',
		height: 40,
		width: 'calc(100% - 16px)',
		borderRadius: '0 20px 20px 0',
		paddingLeft: 24,
		paddingRight: 12,
		'&.active': {
			backgroundColor: theme.palette.secondary.main,
			color: `${theme.palette.secondary.contrastText}!important`,
			pointerEvents: 'none',
			'& .list-item-icon': {
				color: 'inherit'
			}
		},
		'& .list-item-icon': {
			marginRight: 16
		}
	}
}));

function SummarySidebarContent(props) {
	// const user = useSelector(({ summaryApp }) => summaryApp.user);
	const data = useSelector(({ summaryApp }) => summaryApp.summary.summaryDialog.data);
	const classes = useStyles(props);

	return (
		<div className="p-0 lg:p-24 lg:pr-4">
			<FuseAnimate animation="transition.slideLeftIn" delay={200}>
				{/* <Paper className="rounded-0 shadow-none lg:rounded-8 lg:shadow-1"> */}
				<>
					<div className="p-24 flex items-center">
						<SummaryDictionary />
						{/* <Avatar
                            className="mr-12"
                            alt={user.name}
                            src={user.avatar}
                        />
                        <Typography>{user.name}</Typography> */}
					</div>
					<Divider />
					{!data ? (
						<div className="flex flex-col flex-1 items-center justify-center p-24">
							<Paper className="rounded-full p-48">
								<Icon className="block text-64" color="secondary">
									chat
								</Icon>
							</Paper>
							<Typography variant="h6" className="my-24">
								아래한글 저장
							</Typography>
							<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
								저장하시려면 먼저 건을 선택하세요!..
							</Typography>
						</div>
					) : (
						<List>
							<ListItem
								button
								component={NavLinkAdapter}
								to="/apps/summary/all"
								activeClassName="active"
								className={classes.listItem}
							>
								<Icon className="list-item-icon text-16" color="action">
									people
								</Icon>
								<ListItemText className="truncate pr-0" primary="All summary" disableTypography />
							</ListItem>
							<ListItem
								button
								component={NavLinkAdapter}
								to="/apps/summary/frequent"
								activeClassName="active"
								className={classes.listItem}
							>
								<Icon className="list-item-icon text-16" color="action">
									restore
								</Icon>
								<ListItemText
									className="truncate pr-0"
									primary="Frequently contacted"
									disableTypography
								/>
							</ListItem>
							<ListItem
								button
								component={NavLinkAdapter}
								to="/apps/summary/starred"
								activeClassName="active"
								className={classes.listItem}
							>
								<Icon className="list-item-icon text-16" color="action">
									star
								</Icon>
								<ListItemText className="truncate pr-0" primary="Starred summary" disableTypography />
							</ListItem>
						</List>
					)}
					{/* </Paper> */}
				</>
			</FuseAnimate>
		</div>
	);
}

export default SummarySidebarContent;
