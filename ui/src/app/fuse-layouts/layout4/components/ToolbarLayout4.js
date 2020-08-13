import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectToolbarTheme } from 'app/store/fuse/settingsSlice';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';

const useStyles = makeStyles(theme => ({
	root: {}
}));

function toggleFullScreen() {
	if (
		(document.fullScreenElement && document.fullScreenElement !== null) ||
		(!document.mozFullScreen && !document.webkitIsFullScreen)
	) {
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

function ToolbarLayout4(props) {
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(selectToolbarTheme);

	const classes = useStyles(props);

	return (
		<ThemeProvider theme={toolbarTheme}>
			<AppBar
				id="fuse-toolbar"
				className={clsx(classes.root, 'flex relative z-10')}
				color="default"
				style={{ backgroundColor: toolbarTheme.palette.background.paper }}
				elevation={2}
			>
				<Toolbar className="container p-0 lg:px-24 h-40 min-h-40">
					{config.navbar.display && (
						<Hidden lgUp>
							<NavbarMobileToggleButton className="w-36 h-36 p-0" />
						</Hidden>
					)}

					<div className="flex flex-1">{/* <Hidden mdDown>
							<FuseShortcuts />
						</Hidden> */}</div>

					<div className="flex items-center px-16">
						<UserMenu />

						<IconButton className="w-36 h-36 font-200" onClick={() => toggleFullScreen()}>
							<Icon>fullscreen</Icon>
						</IconButton>
						<Button className="font-300">고객센터</Button>
					</div>

					{/*<div className="flex items-center px-16">
						<LanguageSwitcher />

						<FuseSearch />

						<QuickPanelToggleButton />
					</div> */}
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default React.memo(ToolbarLayout4);
