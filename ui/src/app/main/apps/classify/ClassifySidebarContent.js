import React, { useEffect } from 'react';
import {
	// Avatar,
	Divider,
	Icon,
	// List,
	// ListItem,
	// ListItemText,
	Paper,
	Typography
} from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from './store/actions';
import ClassifyDictionary from './ClassifyDictionary';

// const useStyles = makeStyles(theme => ({
//     listItem: {
//         color: "inherit!important",
//         textDecoration: "none!important",
//         height: 40,
//         width: "calc(100% - 16px)",
//         borderRadius: "0 20px 20px 0",
//         paddingLeft: 24,
//         paddingRight: 12,
//         "&.active": {
//             backgroundColor: theme.palette.secondary.main,
//             color: theme.palette.secondary.contrastText + "!important",
//             pointerEvents: "none",
//             "& .list-item-icon": {
//                 color: "inherit"
//             }
//         },
//         "& .list-item-icon": {
//             marginRight: 16
//         }
//     }
// }));

function ClassifySidebarContent(props) {
	// const user = useSelector(({ classifyApp }) => classifyApp.user);
	// const classes = useStyles(props);
	const dispatch = useDispatch();
	const dictionaries = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.dictionaries);
	// const categories = useSelector(
	//     ({ classifyApp }) => classifyApp.classify.classifyDialog.categories
	// );

	const selectedDictionary = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.selectedDictionary);

	useEffect(() => {
		dispatch(Actions.getCategories());
	}, [dispatch]);

	return (
		<div className="p-0 lg:p-24 lg:pr-4">
			<FuseAnimate animation="transition.slideLeftIn" delay={200}>
				{/* <Paper className="rounded-0 shadow-none lg:rounded-8 lg:shadow-1"> */}
				<>
					<div className="px-24 flex items-center">
						<ClassifyDictionary />
						{/* <Avatar
                            className="mr-12"
                            alt={user.name}
                            src={user.avatar}
                        />
                        <Typography>{user.name}</Typography> */}
					</div>
					<Divider />
					{dictionaries.length === 0 ? (
						<div className="flex flex-col flex-1 items-center justify-center p-24">
							<Paper className="rounded-full p-48">
								<Icon className="block text-64" color="secondary">
									chat
								</Icon>
							</Paper>
							<Typography variant="h6" className="my-24">
								분류사전 선택
							</Typography>
							<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
								시작하시려면 먼저 분류사전을 선택하세요!..
							</Typography>
						</div>
					) : (
						<Typography variant="h6" className="m-24">
							{selectedDictionary}
						</Typography>
						// <List>
						//     {categories.map(category => (
						//         <ListItem
						//             button
						//             component={NavLinkAdapter}
						//             to={`/apps/classify/${category.value}`}
						//             key={category.value}
						//             activeClassName="active"
						//             className={classes.listItem}
						//         >
						//             <Icon
						//                 className="list-item-icon text-16"
						//                 color="action"
						//             >
						//                 people
						//             </Icon>
						//             <ListItemText
						//                 className="truncate pr-0"
						//                 primary={category.value}
						//                 disableTypography={true}
						//             />
						//         </ListItem>
						//     ))}
						// </List>
					)}
					{/* </Paper> */}
				</>
			</FuseAnimate>
		</div>
	);
}

export default ClassifySidebarContent;
