import React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import cls from 'classnames';

const styles = createStyles({
	container: {
		zIndex: 70,
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.3rem',
		color: '#ffffff',
		boxShadow: '0 0 2rem 0 currentColor',
		overflow: 'hidden',
		backgroundColor: 'currentColor'
	},
	checkbox: {
		color: 'inherit',
		padding: '0.1rem',
		width: '1.2rem',
		height: '1.2rem'
	},
	checked: {
		color: '#00ccff',
		boxShadow: '0 0 0.4rem 0 #00000044'
	}
});

interface Props extends WithStyles<typeof styles> {
	checked: boolean;
	onClick: (evt: React.MouseEvent) => any;
	className?: string;
}

class Checkbox extends React.Component<Props> {
	public handleClick = (evt: React.MouseEvent) => {
		this.props.onClick(evt);
	}

	public render() {
		const {classes, checked, className} = this.props;
		return (
			<div className={cls(classes.container, {[classes.checked]: checked}, className)} onClick={this.handleClick}>
				<div
					className={classes.checkbox}
					color="primary"
				/>
			</div>
		)
	}
}

export default withStyles(styles)(Checkbox);
