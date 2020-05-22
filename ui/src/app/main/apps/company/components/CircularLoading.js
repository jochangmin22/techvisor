import { useTimeout } from '@fuse/hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

function CircularLoading(props) {
	const [showLoading, setShowLoading] = useState(props.delay);

	useTimeout(() => {
		setShowLoading(false);
	}, props.delay);

	if (!showLoading) {
		return null;
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center">
			<Typography className="text-16 my-24" color="primary">
				Loading...
			</Typography>
			<CircularProgress size={24} />
		</div>
	);
}

CircularLoading.propTypes = {
	delay: PropTypes.oneOfType([PropTypes.number, PropTypes.bool])
};

CircularLoading.defaultProps = {
	delay: 10000
};

export default CircularLoading;
