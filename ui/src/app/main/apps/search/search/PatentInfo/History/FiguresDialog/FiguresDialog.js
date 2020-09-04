import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Dialog from '@material-ui/core/Dialog';
// import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

function FiguresDialog(props, ref) {
	const { src } = props;

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = value => {
		setOpen(false);
	};

	useImperativeHandle(ref, () => {
		return {
			openDialog: () => {
				handleOpen();
			}
		};
	});

	if (!src) {
		return null;
	}

	return (
		<Dialog
			classes={{
				paper: 'w-full m-24 rounded-8'
			}}
			// TransitionComponent={Transition}
			onClose={handleClose}
			open={open}
		>
			<div className="flex flex-col w-full">
				<FuseScrollbars className="flex flex-auto w-full max-h-640">
					<div className="w-full">
						{src && src !== '' && (
							<div className="relative">
								<img src={src} className="w-full block" alt="note" />
								<Fab
									className="absolute right-0 bottom-0 m-8"
									variant="extended"
									size="small"
									color="primary"
									aria-label="close Image"
									onClick={handleClose}
								>
									<Icon fontSize="small">close</Icon>
								</Fab>
							</div>
						)}
					</div>
				</FuseScrollbars>
			</div>
		</Dialog>
	);
}

export default forwardRef(FiguresDialog);
