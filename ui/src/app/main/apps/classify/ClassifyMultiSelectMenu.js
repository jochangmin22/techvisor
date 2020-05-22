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

function ClassifyMultiSelectMenu(props) {
    const dispatch = useDispatch();
    const selectedContactIds = useSelector(
        ({ classifyApp }) => classifyApp.classify.selectedContactIds
    );

    const [anchorEl, setAnchorEl] = useState(null);

    function openSelectedContactMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function closeSelectedClassifyMenu() {
        setAnchorEl(null);
    }

    return (
        <React.Fragment>
            <IconButton
                className="p-0"
                aria-owns={anchorEl ? "selectedClassifyMenu" : null}
                aria-haspopup="true"
                onClick={openSelectedContactMenu}
            >
                <Icon>more_horiz</Icon>
            </IconButton>
            <Menu
                id="selectedClassifyMenu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeSelectedClassifyMenu}
            >
                <MenuList>
                    <MenuItem
                        onClick={() => {
                            dispatch(
                                Actions.removeClassify(selectedContactIds)
                            );
                            closeSelectedClassifyMenu();
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
                                Actions.setClassifyStarred(selectedContactIds)
                            );
                            closeSelectedClassifyMenu();
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
                                Actions.setClassifyUnstarred(selectedContactIds)
                            );
                            closeSelectedClassifyMenu();
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

export default ClassifyMultiSelectMenu;
