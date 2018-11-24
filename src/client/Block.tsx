import * as React from 'react';
import {findDOMNode} from 'react-dom';
import cls from 'classnames';
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
	focus: {},
	root: {
		position: 'relative',
		paddingTop: '0.6rem',
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
		boxShadow: '0 0 4px 0 #00000033',
		borderRadius: '0.4rem',
		overflow: 'hidden',
		'$focus &': {
			boxShadow: '0 0 20px 0 #0043ff6e'
		}
	},
	title: {
		display: 'flex',
		textAlign: 'left',
		paddingRight: '2rem',
		'& pre': {
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px',
			resize: 'none',
			flex: 1,
			border: 'none',
			padding: '0.6rem',
			backgroundColor: 'transparent',
			fontWeight: 500
		},
		'.print &': {
			paddingRight: 0
		},
		'@media print': {
			paddingRight: 0
		}
	},
	text: {
		display: 'flex',
		textAlign: 'left',
		paddingRight: '2rem',
		'& pre': {
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px',
			resize: 'none',
			flex: 1,
			border: 'none',
			padding: '0.6rem',
			backgroundColor: 'transparent'
		},
		'.print &': {
			paddingRight: 0
		},
		'@media print': {
			paddingRight: 0
		}
	},
	textarea: {
		fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
		fontSize: '11px',
		resize: 'none',
		flex: 1,
		border: 'none',
		padding: '0.6rem',
		backgroundColor: 'transparent',
		'$title > &': {
			fontWeight: 500
		},
		'pre&': {
			display: 'none',
			margin: 0,
			whiteSpace: 'pre-wrap'
		},
		'.print textarea&': {
			display: 'none'
		},
		'.print pre&': {
			display: 'block'
		}
	},
	actionsLeft: {
		position: 'absolute',
		top: 0,
		left: 0,
		transform: 'translateX(-100%)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '5rem',
		height: '100%',
		opacity: 0,
		'$focus &': {
			opacity: 0.5
		},
		'$root:hover &': {
			opacity: 0.5
		},
		'@media (hover: none)': {
			opacity: 0.5
		}
	},
	actionsRight: {
		position: 'absolute',
		top: 0,
		right: 0,
		transform: 'translateX(100%)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '5rem',
		height: '100%',
		opacity: 0,
		'$focus &': {
			opacity: 0.5
		},
		'$root:hover &': {
			opacity: 0.5
		},
		'@media (hover: none)': {
			opacity: 0.5
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
		justifyContent: 'center',
		cursor: 'grab',
		zIndex: 60,
		opacity: 0,
		'$focus &': {
			opacity: 1
		},
		'$root:hover &': {
			opacity: 1
		},
		'@media (hover: none)': {
			opacity: 1
		},
		'&:active': {
			cursor: 'move'
		},
		'.print &': {
			display: 'none'
		},
		'@media print': {
			display: 'none'
		}
	},
	handleIcon: {
		width: '1.2rem',
		height: '1.2rem',
		color: '#000',
		opacity: 0.4
	},
	actionsTop: {
		display: 'flex',
		overflow: 'hidden',
		justifyContent: 'space-around',
		alignItems: 'center',
		backgroundColor: '#666666',
		padding: '0 2.6rem 0 0.6rem',
		boxShadow: '0 0 0.8rem 0 rgba(0,0,0,0.3)',
		height: 0,
		zIndex: 50,
		boxSizing: 'border-box',
		transition: 'all 0.3s',
		'& > button': {
			color: '#ffffffbb',
			fontSize: '1rem',
			fontWeight: 700
		},
		'.print &': {
			display: 'none'
		},
		'@media (max-width: 500px)': {
			zIndex: 70,
			position: 'fixed',
			top: '5rem',
			left: 0,
			width: '100%',
			boxShadow: '0 0 0.8rem 0 rgba(0,0,0,0.6)',
			padding: '0 1rem'
		},
		'@media print': {
			display: 'none'
		}
	},
	actionsBottom: {
		display: 'flex',
		overflow: 'hidden',
		justifyContent: 'space-around',
		alignItems: 'center',
		backgroundColor: '#666666',
		padding: '0 2.6rem 0 0.6rem',
		boxShadow: '0 0 0.8rem 0 rgba(0,0,0,0.3)',
		height: 0,
		zIndex: 50,
		boxSizing: 'border-box',
		transition: 'all 0.3s',
		'& > button': {
			color: '#ffffffbb',
			fontSize: '1rem',
			fontWeight: 700
		},
		'& > button:disabled': {
			color: '#ffffff77'
		},
		'.print &': {
			display: 'none'
		},
		'@media (max-width: 500px)': {
			zIndex: 70,
			position: 'fixed',
			bottom: 0,
			left: 0,
			width: '100%',
			boxShadow: '0 0 0.8rem 0 rgba(0,0,0,0.6)',
			padding: '0 1rem'
		},
		'@media print': {
			display: 'none'
		}
	},
	actionsEnter: {
		padding: '0 2.6rem 0 0.6rem',
		height: 0,
		'@media (max-width: 500px)': {
			padding: '0 1rem'
		}
	},
	actionsActive: {
		padding: '0 2.6rem 0 0.6rem',
		height: '2.2rem',
		'@media (max-width: 500px)': {
			padding: '0.6rem 1rem',
			height: '5rem'
		}
	},
	actionsEnterDone: {
		padding: '0 2.6rem 0 0.6rem',
		height: '2.2rem',
		'@media (max-width: 500px)': {
			padding: '0.6rem 1rem',
			height: '5rem'
		}
	},
	actionsExit: {
		padding: '0 2.6rem 0 0.6rem',
		height: '2.2rem',
		'@media (max-width: 500px)': {
			padding: '0.6rem 1rem',
			height: '5rem'
		}
	},
	actionsExitActive: {
		padding: '0 2.6rem 0 0.6rem',
		height: 0,
		'@media (max-width: 500px)': {
			padding: '0 1rem'
		}
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
	focus: boolean;
	export?: boolean;
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
			index,
			block
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

class Block extends React.PureComponent<OwnProps & WithStyles<typeof styles> & BlockSourceCollectedProps & BlockTargetCollectedProps> {
	public titleRef = React.createRef<any>();
	public bodyRef = React.createRef<any>();

	public state = {
		showColorPicker: false
	};

	public componentDidUpdate(prevProps: OwnProps) {
		if (prevProps.block.indent !== this.props.block.indent) {
			if (this.titleRef.current) {
				this.titleRef.current.dispatchEvent('autosize:update');
			}
			if (this.bodyRef.current) {
				this.bodyRef.current.dispatchEvent('autosize:update');
			}
		}
	}

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

	public handleMoveUp = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.props.moveBlock(this.props.index - 1, this.props.index);
	}

	public handleMoveDown = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.props.moveBlock(this.props.index + 1, this.props.index);
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
			focus,
			connectDragSource,
			connectDropTarget,
			connectDragPreview,
			isDragging,
			index,
			export: exp
		} = this.props;

		const actionsTop = [
			{label: 'Add Before', fn: this.handleAddBefore},
			{label: 'Add After', fn: this.handleAddAfter},
			{label: 'Move Up', fn: this.handleMoveUp},
			{label: 'Move Down', fn: this.handleMoveDown}
		];

		const actionsBottom = [
			{label: 'Color', fn: this.handleOpenColorPicker},
			{
				label: block.showTitle ? 'Remove Title' : 'Add Title',
				fn: this.handleToggleTitle,
				disabled: block.showTitle && !block.showBody
			},
			{
				label: block.showBody ? 'Remove Body' : 'Add Body',
				fn: this.handleToggleBody,
				disabled: block.showBody && !block.showTitle
			},
			{label: 'Delete', fn: this.handleDelete}
		];

		const tabIndex = index * 2 + 1;

		const transitionClassNames = {
			enter: classes.actionsEnter,
			enterActive: classes.actionsActive,
			enterDone: classes.actionsEnterDone,
			exit: classes.actionsExit,
			exitActive: classes.actionsExitActive
		};

		let elem = (
			<div
				key={block.id}
				className={cls(classes.root, {[classes.focus]: focus})}
				style={{
					paddingLeft: `${block.indent * 4}rem`,
					opacity: isDragging ? 0 : 1
				}}
				onClick={onClick}
			>
				<div className={classes.actionsLeft}>
					<button onClick={this.handleDecreaseIndent}>
						<IndentDecIcon/>
					</button>
				</div>
				<div className={classes.content}>
					<CSSTransition
						in={focus}
						key={`${block.id}-top`}
						classNames={transitionClassNames}
						timeout={0}
					>
						<div className={classes.actionsTop} onClick={this.handleCloseColorPicker}>
							{actionsTop.map(a => (
								<button key={a.label} onClick={a.fn}>{a.label}</button>
							))}
						</div>
					</CSSTransition>
					{block.showTitle && (
						<div
							className={classes.title}
							style={{backgroundColor: block.color}}
						>
							<TextareaAutosize
								className={classes.textarea}
								tabIndex={exp ? -1 : tabIndex}
								ref={this.titleRef}
								value={block.title}
								onChange={this.getInputHandler('title')}
								onClick={this.handleCloseColorPicker}
								spellCheck={false}
								autoFocus
								async
							/>
							<pre className={classes.textarea}>
								{block.title}
							</pre>
						</div>
					)}
					{block.showBody && (
						<div
							className={classes.text}
							style={{backgroundColor: block.showTitle ? `${block.color}66` : block.color}}
						>
							<TextareaAutosize
								className={classes.textarea}
								tabIndex={exp ? -1 : tabIndex + (block.showTitle ? 1 : 0)}
								ref={this.bodyRef}
								value={block.body}
								onChange={this.getInputHandler('body')}
								onClick={this.handleCloseColorPicker}
								spellCheck={false}
								autoFocus
								async
							/>
							<pre className={classes.textarea}>
								{block.body}
							</pre>
						</div>
					)}
					<CSSTransition
						in={focus}
						key={`${block.id}-bottom`}
						classNames={transitionClassNames}
						timeout={0}
					>
						<div className={classes.actionsBottom} onClick={this.handleCloseColorPicker}>
							{actionsBottom.map(a => (
								<button key={a.label} onClick={a.fn} disabled={a.disabled}>{a.label}</button>
							))}
						</div>
					</CSSTransition>
					{connectDragSource(
						<div className={classes.handle}>
							<MenuIcon className={classes.handleIcon}/>
						</div>
					)}
				</div>
				<div className={classes.actionsRight}>
					<button onClick={this.handleIncreaseIndent}>
						<IndentIncIcon/>
					</button>
				</div>
				<div
					className={classes.color}
					style={{display: this.state.showColorPicker && focus ? 'block' : 'none'}}
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

		elem = connectDropTarget(elem);
		elem = connectDragPreview(elem);

		return elem;
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
