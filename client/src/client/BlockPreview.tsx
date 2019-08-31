import * as React from 'react';
import DragLayer from 'react-dnd/lib/DragLayer';
import {DragLayerMonitor} from 'react-dnd';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import {BlockData} from './BlockList';

function collect(monitor: DragLayerMonitor) {
	const item = monitor.getItem();
	return {
		item,
		currentOffset: monitor.getSourceClientOffset(),
		isDragging: monitor.isDragging()
	};
}

function getItemStyles(currentOffset: {x: number; y: number}): React.CSSProperties {
	if (!currentOffset) {
		return {display: 'none'};
	}

	const x = currentOffset.x;
	const y = currentOffset.y;
	const transform = `translate(${x}px, ${y}px)`;

	return {
		pointerEvents: 'none',
		transform,
		WebkitTransform: transform
	};
}

const styles = createStyles({
	root: {
		position: 'absolute',
		top: 0,
		opacity: 0.7,
		border: '1px solid #000000',
		overflow: 'hidden',
		borderRadius: '0.4rem'
	},
	title: {
		minHeight: '1.5rem',
		paddingRight: '2rem',
		overflow: 'hidden',
		'& pre': {
			padding: '0.6rem',
			whiteSpace: 'normal',
			margin: 0,
			fontWeight: 500,
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px'
		}
	},
	body: {
		minHeight: '1.5rem',
		overflow: 'hidden',
		paddingRight: '2rem',
		'& pre': {
			padding: '0.6rem',
			whiteSpace: 'normal',
			margin: 0,
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px'
		}
	},
	handle: {
		backgroundColor: '#888',
		position: 'absolute',
		top: 0,
		right: 0,
		width: '2rem',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	handleIcon: {
		width: '1.2rem',
		height: '1.2rem',
		color: '#000',
		opacity: 0.4
	}
});

interface Props extends WithStyles<typeof styles> {
	item: any;
	isDragging: boolean;
	currentOffset: {
		x: number;
		y: number;
	};
}

const BlockPreview = withStyles(styles)(({item, isDragging, currentOffset, classes}: Props) => {
	if (!isDragging || !item || !item.block) {
		return null;
	}

	const block = item.block as BlockData;
	const windowWidth = window.innerWidth;
	let blockWidth = windowWidth < 700 ?	(windowWidth - 120) / 10 : 58;
	blockWidth = blockWidth - block.indent * 4;
	blockWidth = Math.round(blockWidth * 10) / 10;

	return (
		<div
			className={classes.root}
			style={{
				...getItemStyles(currentOffset),
				width: `${blockWidth - 0.1}rem`,
				left: `-${blockWidth - 2}rem`
			}}
		>
			{block.showTitle && (
				<div
					className={classes.title}
					style={{backgroundColor: block.color}}
				>
					<pre>{block.title}</pre>
				</div>
			)}
			{block.showBody && (
				<div
					className={classes.body}
					style={{backgroundColor: block.showTitle ? `${block.color}66` : block.color}}
				>
					<pre>{block.body}</pre>
				</div>
			)}
			<div className={classes.handle}>
				<MenuIcon className={classes.handleIcon}/>
			</div>
		</div>
	);
});

export default DragLayer(collect)(BlockPreview);
