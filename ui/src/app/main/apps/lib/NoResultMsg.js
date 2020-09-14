import React from 'react'
import Typography from '@material-ui/core/Typography';

function NoResultMsg() {
    return (
        <div className="flex flex-col flex-1 h-full items-center justify-center px-24">
            <Typography variant="h6" className="my-12">
                검색결과가 없습니다.
				</Typography>
        </div>
    )
}

export default NoResultMsg;
