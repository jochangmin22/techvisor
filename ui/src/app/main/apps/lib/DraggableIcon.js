import React from 'react'
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';

function DraggableIcon() {
    return (
        <Tooltip title="드래그로 이동이 가능합니다." className="pt-4">
            <Icon className="draggable cursor-pointer">menu</Icon>
        </Tooltip>
    )
}

export default DraggableIcon
