import React from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Header.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Header({ right, userMenu }) {
	return (
		<header div className={cx('base header')}>
			<Responsive className="header-wrapper">
				<Link className="brand" to="/">
					TechVisor
				</Link>
				<div className="right">
					{right}
					{userMenu}
				</div>
			</Responsive>
		</header>
	);
}
export default Header;

Header.propTypes = {
	right: PropTypes.node,
	userMenu: PropTypes.node
};
