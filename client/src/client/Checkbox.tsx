import React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import cls from 'classnames';

const styles = createStyles({
	container: {
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: '#ffffff',
		'&$checked': {
			color: '#00ccff',
		},
		'&:hover': {
			opacity: 0.6
		}
	},
	checkbox: {
		color: 'inherit',
		width: '1.4rem',
		height: '1.4rem',
		boxShadow: '0 0 0.4rem 0 rgba(0,0,0,0.27)',
		backgroundColor: 'currentColor',
		borderRadius: '0.3rem',
		'& svg': {
			color: '#ffffff',
			width: '100%',
			height: '100%'
		},
		'$checked &': {
			boxShadow: '0 0 0.4rem 0 rgba(0,0,0,0.27)'
		}
	},
	checked: {}
});

interface Props extends WithStyles<typeof styles> {
	checked: boolean;
	onClick: (evt: React.MouseEvent) => any;
	classNames?: {
		root?: string;
		checkbox?: string;
	}
}

class Checkbox extends React.Component<Props> {
	public handleClick = (evt: React.MouseEvent) => {
		this.props.onClick(evt);
	}

	public render() {
		const {classes, checked, classNames} = this.props;
		return (
			<div
				className={cls(
					classes.container,
					{[classes.checked]: checked},
					classNames && classNames.root
				)}
				onClick={this.handleClick}
			>
				<div
					className={cls(
						classes.checkbox,
						classNames && classNames.checkbox
					)}
					color="primary"
				>
					<CheckIcon/>
				</div>
			</div>
		)
	}
}

export default withStyles(styles)(Checkbox);
