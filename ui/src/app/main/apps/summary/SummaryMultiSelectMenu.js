import React, { useState } from "react";
import {
    Icon,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList
} from "@material-ui/core";
import * as Actions from "./store/actions";
import { useDispatch, useSelector } from "react-redux";

function SummaryMultiSelectMenu(props) {
    const dispatch = useDispatch();
    const selectedContactIds = useSelector(
        ({ summaryApp }) => summaryApp.summary.selectedContactIds
    );

    const [anchorEl, setAnchorEl] = useState(null);

    function openSelectedContactMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function closeSelectedSummaryMenu() {
        setAnchorEl(null);
    }

    return (
        <React.Fragment>
            <IconButton
                className="p-0"
                aria-owns={anchorEl ? "selectedSummaryMenu" : null}
                aria-haspopup="true"
                onClick={openSelectedContactMenu}
            >
                <Icon>more_horiz</Icon>
            </IconButton>
            <Menu
                id="selectedSummaryMenu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeSelectedSummaryMenu}
            >
                <MenuList>
                    <MenuItem
                        onClick={() => {
                            dispatch(
                                Actions.removeSummary(selectedContactIds)
                            );
                            closeSelectedSummaryMenu();
                        }}
                    >
                        <ListItemIcon className="min-w-40">
                            <Icon>delete</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Remove" />
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            dispatch(
                                Actions.setSummaryStarred(selectedContactIds)
                            );
                            closeSelectedSummaryMenu();
                        }}
                    >
                        <ListItemIcon className="min-w-40">
                            <Icon>star</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Starred" />
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            dispatch(
                                Actions.setSummaryUnstarred(selectedContactIds)
                            );
                            closeSelectedSummaryMenu();
                        }}
                    >
                        <ListItemIcon className="min-w-40">
                            <Icon>star_border</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Unstarred" />
                    </MenuItem>
                </MenuList>
            </Menu>
        </React.Fragment>
    );
}

export default SummaryMultiSelectMenu;
