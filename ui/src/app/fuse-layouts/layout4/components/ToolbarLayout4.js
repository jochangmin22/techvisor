// import FuseSearch from '@fuse/core/FuseSearch';
// import FuseShortcuts from '@fuse/core/FuseShortcuts';
import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
// import QuickPanelToggleButton from 'app/fuse-layouts/shared-components/quickPanel/QuickPanelToggleButton';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectToolbarTheme } from 'app/store/fuse/settingsSlice';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import FullScreenToggle from '../../shared-components/FullScreenToggle';
// import LanguageSwitcher from '../../shared-components/LanguageSwitcher';

const useStyles = makeStyles(theme => ({
	root: {}
}));

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
				<Toolbar className="container p-0 lg:px-24 min-h-40 md:min-h-40">
					{config.navbar.display && (
						<Hidden lgUp>
							<NavbarMobileToggleButton className="w-36 h-36 p-0 mx-0 sm:mx-8" />
						</Hidden>
					)}

					<div className="flex flex-1">{/* <Hidden mdDown>
							<FuseShortcuts />
						</Hidden> */}</div>

					<div className="flex items-center px-16">
						<UserMenu />

						<FullScreenToggle />
						<Button
							component="a"
							href="https://www.notion.so/jingu0705/060138803fe046d4a4d4eaab641ca06a"
							target="_blank"
							rel="noreferrer noopener"
							role="button"
							className="font-300"
						>
							서비스안내
						</Button>
						<Button className="font-300">고객센터</Button>
					</div>

					{/* <div className="flex items-center px-16">
						<LanguageSwitcher />

						<FullScreenToggle />

						<FuseSearch />

						<QuickPanelToggleButton />
					</div> */}
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default React.memo(ToolbarLayout4);
