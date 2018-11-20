import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {WithStyles, createStyles, withStyles} from '@material-ui/core';
import TextareaAutosize from 'react-autosize-textarea';
import {CSSTransition} from 'react-transition-group';
import IndentDecIcon from '@material-ui/icons/KeyboardArrowLeft';
import IndentIncIcon from '@material-ui/icons/KeyboardArrowRight';
import MenuIcon from '@material-ui/icons/Menu';
import {SketchPicker, ColorResult} from 'react-color';
import {
	DragSource,
	DropTarget,
	ConnectDragSource,
	ConnectDropTarget,
	DropTargetMonitor,
	ConnectDragPreview
} from 'react-dnd';
import {XYCoord} from 'dnd-core';
import {BlockData} from './BlockList';

const styles = createStyles({
	color: {
		position: 'absolute',
		bottom: '-0.6rem',
		transform: 'translateY(100%)',
		zIndex: 200
	},
	block: {
		position: 'relative',
		marginBottom: '0.6rem',
		display: 'flex',
		flexDirection: 'column',
		'& button': {
			display: 'flex',
			alignItems: 'center',
			border: 'none',
			backgroundColor: 'transparent',
			fontSize: '1.1rem',
			fontWeight: 500
		},
		'& button:not(:disabled)': {
			cursor: 'pointer'
		},
		'& button:not(:disabled):hover': {
			opacity: 0.6
		}
	},
	content: {
		position: 'relative',
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		border: '1px solid #0000007a',
		borderRadius: '0.4rem',
		overflow: 'hidden'
	},
	title: {
		display: 'flex',
		textAlign: 'left',
		padding: 0,
		'& textarea': {
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px',
			resize: 'none',
			flex: 1,
			border: 'none',
			backgroundColor: 'transparent',
			padding: '0.6rem',
			boxSizing: 'border-box',
			fontWeight: 500
		}
	},
	text: {
		display: 'flex',
		textAlign: 'left',
		padding: 0,
		'& textarea': {
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px',
			resize: 'none',
			flex: 1,
			border: 'none',
			backgroundColor: 'transparent',
			padding: '0.6rem',
			boxSizing: 'border-box'
		}
	},
	actionsLeft: {
		position: 'absolute',
		top: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '3rem',
		height: '100%',
		left: '-4.8rem'
	},
	actionsRight: {
		position: 'absolute',
		top: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '3rem',
		height: '100%',
		right: '-4.8rem'
	},
	blockHandle: {
		backgroundColor: '#888',
		position: 'absolute',
		top: 0,
		right: 0,
		width: '2rem',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'grab',
		'&:active': {
			cursor: 'move'
		}
	},
	blockHandleIcon: {
		width: '1.2rem',
		height: '1.2rem',
		color: '#000',
		opacity: 0.4
	},
	blockActions: {
		display: 'flex',
		overflow: 'hidden',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		padding: '0 0.6rem',
		height: 0,
		zIndex: 100,
		boxSizing: 'border-box',
		transition: 'all 0.3s'
	},
	blockActionsEnter: {
		padding: '0 0.6rem',
		height: 0
	},
	blockActionsActive: {
		padding: '0.6rem 0.6rem',
		height: '3rem'
	},
	blockActionsEnterDone: {
		padding: '0.6rem 0.6rem',
		height: '3rem'
	},
	blockActionsExit: {
		padding: '0.6rem 0.6rem',
		height: '3rem'
	},
	blockActionsExitActive: {
		padding: '0 0.6rem',
		height: 0
	}
});

interface OwnProps {
	block: BlockData;
	index: number;
	presetColors: string[];
	moveBlock: (hoverIndex: number, dragIndex: number) => any;
	onChange: (id: any, prop: keyof BlockData, value: any) => any;
	onAddBefore: (id: any) => any;
	onAddAfter: (id: any) => any;
	onDelete: (id: any) => any;
	onClick: (evt: React.MouseEvent) => any;
	showActions: boolean;
}

interface BlockSourceCollectedProps {
	isDragging: boolean;
	connectDragSource: ConnectDragSource;
	connectDragPreview: ConnectDragPreview;
}

interface BlockTargetCollectedProps {
	connectDropTarget: ConnectDropTarget;
}

const cardSource = {
	beginDrag({block, index}: OwnProps) {
		return {
			id: block.id,
			index
		};
	}
};

const cardTarget = {
	hover(props: OwnProps, monitor: DropTargetMonitor, component: Block | null) {
		if (!component) {
			return null;
		}
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return null;
		}

		// Determine rectangle on screen
		const hoverBoundingRect = (findDOMNode(component) as Element).getBoundingClientRect();

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return null;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return null;
		}

		// Time to actually perform the action
		props.moveBlock(dragIndex, hoverIndex);

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex;
		return null;
	}
};

class Block extends React.Component<OwnProps & WithStyles<typeof styles> & BlockSourceCollectedProps & BlockTargetCollectedProps> {
	public titleRef = React.createRef<any>();
	public bodyRef = React.createRef<any>();

	public state = {
		showColorPicker: false
	};

	public handleDecreaseIndent = () => {
		const {onChange, block} = this.props;
		onChange(block.id, 'indent', Math.max(0, block.indent - 1));
	}

	public handleIncreaseIndent = () => {
		const {onChange, block} = this.props;
		onChange(block.id, 'indent', block.indent + 1);
	}

	public getInputHandler = (prop: 'title' | 'body') => (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		const {onChange, block} = this.props;
		onChange(block.id, prop, evt.target.value);
	}

	public focusBlock = () => {
		const {block} = this.props;
		if (block.showTitle) {
			const textarea = this.titleRef.current;
			if (textarea) {
				textarea.focus();
			}
		} else {
			const textarea = this.bodyRef.current;
			if (textarea) {
				textarea.focus();
			}
		}
	}

	public handleChangeColor = (color: ColorResult) => {
		const {onChange, block} = this.props;
		onChange(block.id, 'color', color.hex);
	};

	public handleToggleTitle = (evt: React.MouseEvent) => {
		const {onChange, block} = this.props;
		evt.stopPropagation();
		onChange(block.id, 'showTitle', !block.showTitle);
	};

	public handleToggleBody = (evt: React.MouseEvent) => {
		const {onChange, block} = this.props;
		evt.stopPropagation();
		onChange(block.id, 'showBody', !block.showBody);
	};

	public handleOpenColorPicker = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({showColorPicker: true});
	}

	public handleCloseColorPicker = () => {
		this.setState({showColorPicker: false});
	}

	public handleAddBefore = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.props.onAddBefore(this.props.block.id);
	}

	public handleAddAfter = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.props.onAddAfter(this.props.block.id);
	}

	public handleDelete = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.props.onDelete(this.props.block.id);
	}

	public preventClickPropagation = (evt: React.MouseEvent) => {
		evt.stopPropagation();
	}

	public render() {
		const {
			block,
			presetColors,
			classes,
			onClick,
			connectDragSource,
			connectDropTarget,
			connectDragPreview,
			isDragging
		} = this.props;

		const elem = (
			<div
				key={block.id}
				className={classes.block}
				style={{paddingLeft: `${block.indent * 4}rem`, opacity: isDragging ? 0 : 1}}
				onClick={onClick}
			>
				<div className={classes.actionsLeft}>
					<button onClick={this.handleDecreaseIndent}>
						<IndentDecIcon/>
					</button>
				</div>
				{connectDragPreview(
					<div className={classes.content}>
						{block.showTitle && (
							<div
								className={classes.title}
								style={{backgroundColor: block.color}}
							>
								<TextareaAutosize
									ref={this.titleRef}
									value={block.title}
									onChange={this.getInputHandler('title')}
									onClick={this.handleCloseColorPicker}
									spellCheck={false}
									style={{minHeight: '27px'}}
									autoFocus
								/>
							</div>
						)}
						{block.showBody && (
							<div
								className={classes.text}
								style={{backgroundColor: block.showTitle ? `${block.color}66` : block.color}}
							>
								<TextareaAutosize
									ref={this.bodyRef}
									value={block.body}
									onChange={this.getInputHandler('body')}
									onClick={this.handleCloseColorPicker}
									spellCheck={false}
									style={{minHeight: '27px'}}
									autoFocus
								/>
							</div>
						)}
						<CSSTransition
							in={this.props.showActions}
							key={block.id}
							classNames={{
								enter: classes.blockActionsEnter,
								enterActive: classes.blockActionsActive,
								enterDone: classes.blockActionsEnterDone,
								exit: classes.blockActionsExit,
								exitActive: classes.blockActionsExitActive
							}}
							timeout={0}
						>
							<div className={classes.blockActions} onClick={this.handleCloseColorPicker}>
								<button onClick={this.handleAddBefore}>{'Add Before'}</button>
								<button onClick={this.handleOpenColorPicker}>{'Color'}</button>
								<button
									onClick={this.handleToggleTitle}
									disabled={!block.showBody}
								>
									{block.showTitle ? 'Remove Title' : 'Add Title'}
								</button>
								<button
									onClick={this.handleToggleBody}
									disabled={!block.showTitle}
								>
									{block.showBody ? 'Remove Body' : 'Add Body'}
								</button>
								<button onClick={this.handleDelete}>{'Delete'}</button>
								<button onClick={this.handleAddAfter}>{'Add After'}</button>
							</div>
						</CSSTransition>
						{connectDragSource(
							<div className={classes.blockHandle}>
								<MenuIcon className={classes.blockHandleIcon}/>
							</div>
						)}
					</div>
				)}
				<div className={classes.actionsRight}>
					<button onClick={this.handleIncreaseIndent}>
						<IndentIncIcon/>
					</button>
				</div>
				<div
					className={classes.color}
					style={{display: this.state.showColorPicker && this.props.showActions ? 'block' : 'none'}}
				>
					<SketchPicker
						disableAlpha
						color={block.color}
						onChange={this.handleChangeColor}
						presetColors={presetColors}
					/>
				</div>
			</div>
		);

		return connectDropTarget(elem);
	}
}

const StyledBlock = withStyles(styles)(Block);

const dropTarget = DropTarget<OwnProps, BlockTargetCollectedProps>(
	'block',
	cardTarget,
	connect => ({
		connectDropTarget: connect.dropTarget()
	})
);

const dragSource = DragSource<OwnProps, BlockSourceCollectedProps>(
	'block',
	cardSource,
	(connect, monitor) => ({
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging()
	})
);

export default dropTarget(dragSource(StyledBlock));
