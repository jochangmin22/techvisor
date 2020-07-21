import React from 'react';
// import {
//     Icon,
//     Input,
//     Paper,
//     Button,
//     Typography,
//     Hidden
// } from "@material-ui/core";
import Icon from '@material-ui/core/Icon';
// import Input from "@material-ui/core/Input";
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';

import { ThemeProvider } from '@material-ui/core/styles';
import { selectMainTheme } from 'app/store/fuse/settingsSlice';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
// import { Link } from "react-router-dom";
// import * as Actions from "./store/actions";

function SurveyAnnounce(props) {
	// const dispatch = useDispatch();
	// const searchText = useSelector(
	//     ({ searchApp }) => searchApp.searchs.searchText
	// );
	// const thsrsClickAwayOpen = useSelector(
	//     ({ searchApp }) => searchApp.thsrs.thsrsClickAwayOpen
	// );
	// const optionsClickAwayOpen = useSelector(
	//     ({ searchApp }) => searchApp.options.optionsClickAwayOpen
	// );
	// const applicantClickAwayOpen = useSelector(
	//     ({ searchApp }) => searchApp.applicant.applicantClickAwayOpen
	// );

	const mainTheme = useSelector(selectMainTheme);

	return (
		<ThemeProvider theme={mainTheme}>
			<div className="flex w-full items-center justify-around p-6">
				<FuseAnimate animation="transition.slideLeftIn" delay={300}>
					<Typography className="hidden sm:flex sm:justify-center sm:w-1/6" variant="h6">
						검색이력
					</Typography>
				</FuseAnimate>
				<FuseAnimate animation="transition.slideDownIn" delay={300}>
					<Paper className="flex items-center w-full sm:w-5/6 pr-8 py-4 rounded-8" elevation={1}>
						<Icon className="mr-8" color="action">
							search
						</Icon>
					</Paper>
				</FuseAnimate>
			</div>

			{/*             <div className="flex flex-1">
                <Paper className="flex items-center w-full h-48 sm:h-56 p-16 pl-4 md:pl-16 rounded-8 " elevation={1}>
                    <Hidden lgUp>
                        <IconButton
                            onClick={(ev) => props.pageLayout.current.toggleLeftSidebar()}
                            aria-label="open left sidebar"
                        >
                            <Icon>menu</Icon>
                        </IconButton>
                    </Hidden>

                    <Icon color="action">search</Icon>

                    <Input
                        placeholder="Search"
                        className="pl-16"
                        disableUnderline
                        fullWidth
                        value={searchText}
                        inputProps={{
                            'aria-label': 'Search'
                        }}
                        onChange={ev => dispatch(setSearchText(ev))}
                    />
                </Paper>
            </div> */}
		</ThemeProvider>
	);
}

export default SurveyAnnounce;
