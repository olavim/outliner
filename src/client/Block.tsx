import * as React from 'react';
import {findDOMNode} from 'react-dom';
import cls from 'classnames';
import {WithStyles, createStyles, withStyles, IconButton} from '@material-ui/core';
import TextareaAutosize from 'react-autosize-textarea';
import {CSSTransition} from 'react-transition-group';
import IndentDecIcon from '@material-ui/icons/KeyboardArrowLeft';
import IndentIncIcon from '@material-ui/icons/KeyboardArrowRight';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import DeleteIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import ColorIcon from '@material-ui/icons/ColorLens';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
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
import Checkbox from './Checkbox';

const theme = {
	handleBreakpoint: '700px',
	actionsBreakpoint: '760px',
	actions: {
		height: {
			primary: '3.4rem',
			responsive: '5rem'
		}
	}
}

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
		marginTop: '0.6rem',
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
	outerContent: {
		position: 'relative',
		flex: 1,
		display: 'flex'
	},
	content: {
		position: 'relative',
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		border: '1px solid #00000033',
		boxShadow: '0 0 0.3rem 0 #00000022',
		borderRadius: '0.4rem',
		overflow: 'hidden',
		'$focus &': {
			[`@media (max-width: ${theme.actionsBreakpoint})`]: {
				boxShadow: '0 0 2rem 0 #0043ff6e'
			}
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
			margin: 0,
			whiteSpace: 'pre-wrap',
			cursor: 'pointer'
		},
		'pre&:active': {
			cursor: 'text'
		},
		'$focus pre&': {
			display: 'none'
		}
	},
	indentLeft: {
		position: 'absolute',
		top: 0,
		left: 0,
		transform: 'translateX(-100%)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '6rem',
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
		},
		[`@media (max-width: ${theme.handleBreakpoint})`]: {
			width: '4rem'
		}
	},
	indentRight: {
		position: 'absolute',
		top: 0,
		right: '-3rem',
		transform: 'translateX(100%)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '2rem',
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
		},
		[`@media (max-width: ${theme.handleBreakpoint})`]: {
			right: 0,
			width: '4rem'
		}
	},
	handleWrapper: {
		position: 'absolute',
		top: 0,
		right: '-2.4rem',
		paddingLeft: '0.4rem',
		height: '100%',
		[`@media (max-width: ${theme.handleBreakpoint})`]: {
			display: 'none'
		}
	},
	handle: {
		backgroundColor: '#888',
		width: '2rem',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'grab',
		zIndex: 60,
		opacity: 0,
		boxShadow: '0 0 1rem 0 #00000047',
		borderRadius: '0.4rem',
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
		}
	},
	handleIcon: {
		width: '1.2rem',
		height: '1.2rem',
		color: '#000',
		opacity: 0.4
	},
	focusTaker: {
		marginTop: 'auto',
		marginBottom: 'auto'
	},
	actions: {
		height: 0,
		borderRadius: '0.4rem',
		width: '100%',
		display: 'flex',
		overflow: 'hidden',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		padding: '0 1rem',
		boxShadow: '0 0 0.4rem 0 rgba(0,0,0,0.1)',
		zIndex: 50,
		boxSizing: 'border-box',
		transition: 'all 0.3s',
		'& > button': {
			color: '#000000bb',
			fontSize: '1rem',
			fontWeight: 700,
			padding: '0.4rem'
		},
		'& > button:disabled': {
			color: '#00000077'
		},
		'& > button:not(:last-child)': {
			marginRight: '2rem'
		},
		'& svg': {
			fontSize: '1.8rem'
		},
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			zIndex: 70,
			position: 'fixed',
			left: 0,
			width: '100%',
			boxShadow: '0 0 0.8rem 0 rgba(0,0,0,0.6)',
			padding: '0 1rem',
			borderRadius: 0
		}
	},
	actionsTop: {
		justifyContent: 'flex-end',
		'& button:first-child': {
			marginRight: 'auto'
		},
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			top: '5rem'
		},
		'@media (max-height: 500px) and (orientation:landscape)': {
			display: 'none'
		}
	},
	actionsBottom: {
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			bottom: 0
		},
		'@media (max-height: 500px) and (orientation:landscape)': {
			display: 'none'
		}
	},
	actionsLeft: {
		display: 'none',
		width: 0,
		flexDirection: 'column',
		padding: 0,
		'& > button:not(:last-child)': {
			marginRight: 0
		},
		'& > button:not($focusTaker)': {
			'@media (max-height: 240px) and (orientation:landscape)': {
				display: 'none'
			}
		},
		'& > $focusTaker': {
			display: 'none',
			'@media (max-height: 240px) and (orientation:landscape)': {
				display: 'flex'
			}
		},
		'@media (max-height: 500px) and (orientation:landscape)': {
			display: 'flex',
			left: 0,
			top: '5rem',
			height: 'calc(100% - 5rem)'
		}
	},
	actionsEnter: {
		margin: 0,
		height: 0,
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			padding: '0 1rem'
		}
	},
	actionsActive: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsEnterDone: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsExit: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsExitActive: {
		margin: 0,
		height: 0,
		[`@media (max-width: ${theme.actionsBreakpoint})`]: {
			padding: '0 1rem'
		}
	},
	actionsLeftEnter: {
		width: 0,
		padding: 0
	},
	actionsLeftActive: {
		width: '6rem',
		padding: '1rem 1rem'
	},
	actionsLeftEnterDone: {
		width: '6rem',
		padding: '1rem 1rem'
	},
	actionsLeftExit: {
		width: '6rem',
		padding: '1rem 1rem'
	},
	actionsLeftExitActive: {
		width: 0,
		padding: 0
	},
	checkbox: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: '0.6rem'
	},
	addButton: {
		margin: 0,
		height: 0,
		overflow: 'hidden',
		fontSize: '1.1rem',
		fontWeight: 600,
		borderRadius: '0.4rem',
		color: '#00000080',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.3s',
		'&:hover': {
			color: '#00000060'
		},
		'& svg': {
			color: 'inherit',
			marginRight: '0.6rem',
			fontSize: '1.6rem'
		}
	},
	addButtonEnter: {
		margin: 0,
		height: 0
	},
	addButtonActive: {
		margin: '0.6rem',
		height: theme.actions.height.primary
	},
	addButtonEnterDone: {
		margin: '0.6rem',
		height: theme.actions.height.primary
	},
	addButtonExit: {
		margin: '0.6rem',
		height: theme.actions.height.primary
	},
	addButtonExitActive: {
		margin: 0,
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
	focus: boolean;
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
		console.log(this.props.block.id);
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

	public handleClickExportCheckbox = (evt: React.MouseEvent) => {
		const {onChange, block} = this.props;
		evt.stopPropagation();
		onChange(block.id, 'export', !block.export);
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
			index
		} = this.props;

		const actionsTop = [
			{label: 'Move Up', icon: UpIcon, fn: this.handleMoveUp, disabled: false},
			{
				label: block.showTitle ? 'Remove Title' : 'Add Title',
				fn: this.handleToggleTitle,
				disabled: block.showTitle && !block.showBody
			},
			{
				label: block.showBody ? 'Remove Body' : 'Add Body',
				fn: this.handleToggleBody,
				disabled: block.showBody && !block.showTitle
			}
		];

		const actionsBottom = [
			{label: 'Move Down', icon: DownIcon, fn: this.handleMoveDown, disabled: false},
			{label: 'Color', icon: ColorIcon, fn: this.handleOpenColorPicker, disabled: false},
			{label: 'Delete', icon: DeleteIcon, fn: this.handleDelete, disabled: false}
		];

		// Landscape mode actions
		const actionsLeft = [
			actionsTop[0], actionsBottom[0],
			actionsTop[1], actionsTop[2],
			actionsBottom[1],
			actionsBottom[2]
		];

		const tabIndex = index * 2 + 1;

		const actionsTransitionClassNames = {
			enter: classes.actionsEnter,
			enterActive: classes.actionsActive,
			enterDone: classes.actionsEnterDone,
			exit: classes.actionsExit,
			exitActive: classes.actionsExitActive
		};

		const actionsLeftTransitionClassNames = {
			enter: classes.actionsLeftEnter,
			enterActive: classes.actionsLeftActive,
			enterDone: classes.actionsLeftEnterDone,
			exit: classes.actionsLeftExit,
			exitActive: classes.actionsLeftExitActive
		};

		const addButtonTransitionClassNames = {
			enter: classes.addButtonEnter,
			enterActive: classes.addButtonActive,
			enterDone: classes.addButtonEnterDone,
			exit: classes.addButtonExit,
			exitActive: classes.addButtonExitActive
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
				<div className={classes.indentLeft}>
					<button onClick={this.handleDecreaseIndent}>
						<IndentDecIcon/>
					</button>
				</div>
				<CSSTransition
					in={focus}
					key={`${block.id}-addbtn-top`}
					classNames={addButtonTransitionClassNames}
					timeout={0}
				>
					<div className={classes.addButton} onClick={this.handleAddBefore}>
						<AddIcon/>
						Add Block
					</div>
				</CSSTransition>
				<CSSTransition
					in={focus}
					key={`${block.id}-top`}
					classNames={actionsTransitionClassNames}
					timeout={0}
				>
					<div className={cls(classes.actions, classes.actionsTop)}>
						{actionsTop.map(a => a.icon ? (
							<IconButton key={a.label} onClick={a.fn} disabled={a.disabled}>
								<a.icon/>
							</IconButton>
						) : (
							<button key={a.label} onClick={a.fn} disabled={a.disabled}>{a.label}</button>
						))}
					</div>
				</CSSTransition>
				<CSSTransition
					in={focus}
					key={`${block.id}-left`}
					classNames={actionsLeftTransitionClassNames}
					timeout={0}
				>
					<div className={cls(classes.actions, classes.actionsLeft)}>
						<IconButton className={classes.focusTaker}>
							<MoreVertIcon/>
						</IconButton>
						{actionsLeft.map(a => a.icon ? (
							<IconButton key={a.label} onClick={a.fn} disabled={a.disabled}>
								<a.icon/>
							</IconButton>
						) : (
							<button key={a.label} onClick={a.fn} disabled={a.disabled}>{a.label}</button>
						))}
					</div>
				</CSSTransition>
				<div className={classes.outerContent}>
					<div className={classes.content}>
						<Checkbox
							checked={block.export}
							onClick={this.handleClickExportCheckbox}
							classNames={{root: classes.checkbox}}
						/>
						{block.showTitle && (
							<div
								className={classes.title}
								style={{backgroundColor: block.color}}
							>
								{focus && (
									<TextareaAutosize
										className={classes.textarea}
										tabIndex={tabIndex}
										ref={this.titleRef}
										value={block.title}
										onChange={this.getInputHandler('title')}
										onClick={this.handleCloseColorPicker}
										spellCheck={false}
										autoFocus
									/>
								)}
								<pre className={classes.textarea}>
									{block.title}
								</pre>
							</div>
						)}
						{block.showBody && (
							<div
								className={classes.text}
								style={{backgroundColor: `${block.color}66`}}
							>
								{focus && (
									<TextareaAutosize
										className={classes.textarea}
										tabIndex={tabIndex + (block.showTitle ? 1 : 0)}
										ref={this.bodyRef}
										value={block.body}
										onChange={this.getInputHandler('body')}
										onClick={this.handleCloseColorPicker}
										spellCheck={false}
										autoFocus
									/>
								)}
								<pre className={classes.textarea}>
									{block.body}
								</pre>
							</div>
						)}
					</div>
					<div className={classes.handleWrapper}>
						{connectDragSource(
							<div className={classes.handle}>
								<MenuIcon className={classes.handleIcon}/>
							</div>
						)}
					</div>
				</div>
				<CSSTransition
					in={focus}
					key={`${block.id}-bottom`}
					classNames={actionsTransitionClassNames}
					timeout={0}
				>
					<div className={cls(classes.actions, classes.actionsBottom)} onClick={this.handleCloseColorPicker}>
						{actionsBottom.map(a => a.icon ? (
							<IconButton key={a.label} onClick={a.fn} disabled={a.disabled}>
								<a.icon/>
							</IconButton>
						) : (
							<button key={a.label} onClick={a.fn} disabled={a.disabled}>{a.label}</button>
						))}
					</div>
				</CSSTransition>
				<CSSTransition
					in={focus}
					key={`${block.id}-addbtn-bottom`}
					classNames={addButtonTransitionClassNames}
					timeout={0}
				>
					<div className={classes.addButton} onClick={this.handleAddAfter}>
						<AddIcon/>
						Add Block
					</div>
				</CSSTransition>
				<div className={classes.indentRight}>
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
