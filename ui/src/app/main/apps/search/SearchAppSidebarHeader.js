import React from 'react';
import Icon from '@material-ui/core/Icon';
import FuseAnimate from '@fuse/core/FuseAnimate';

function SearchAppSidebarHeader(props) {
	return (
		<div className="flex flex-col justify-center h-full p-24">
			<div className="flex items-center flex-1">
				<FuseAnimate animation="transition.expandIn" delay={300}>
					<Icon className="mr-16 text-32">search</Icon>
				</FuseAnimate>
				<FuseAnimate animation="transition.slideLeftIn" delay={300}>
					<span className="text-24">기본검색</span>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default SearchAppSidebarHeader;
