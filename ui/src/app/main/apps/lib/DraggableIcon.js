import React from 'react';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';

function DraggableIcon(props) {
	const className = props.className ? props.className : 'pt-4';
	return (
		<Tooltip title="드래그로 이동이 가능합니다." className={className}>
			<Icon className="draggable cursor-pointer">menu</Icon>
		</Tooltip>
	);
}

export default DraggableIcon;
