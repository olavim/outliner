import * as React from 'react';
import {findDOMNode} from 'react-dom';
import cls from 'classnames';
import {WithStyles, createStyles, withStyles, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText} from '@material-ui/core';
import TextareaAutosize from 'react-autosize-textarea';
import {CSSTransition} from 'react-transition-group';
import IndentDecIcon from '@material-ui/icons/KeyboardArrowLeft';
import IndentIncIcon from '@material-ui/icons/KeyboardArrowRight';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import DeleteIcon from '@material-ui/icons/Close';
import ColorIcon from '@material-ui/icons/ColorLens';
import {
	DragSource,
	DropTarget,
	ConnectDragSource,
	ConnectDropTarget,
	DropTargetMonitor,
	ConnectDragPreview
} from 'react-dnd';
import {XYCoord} from 'dnd-core';
import hex2rgba from 'hex-to-rgba';
import {BlockData} from './BlockList';
import Checkbox from './Checkbox';
import isMobile from '@/lib/is-mobile';

const theme = {
	handleWidthBreakpoint: 760,
	handleHeightBreakpoint: 600,
	actionsBreakpoint: 760,
	actions: {
		height: {
			primary: '3.4rem',
			responsive: '5rem'
		}
	}
}

const styles = createStyles({
	focus: {},
	root: {
		position: 'relative',
		marginTop: '0.6rem',
		display: 'flex',
		flexDirection: 'column',
		cursor: 'pointer',
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
		flex: '1 1 auto',
		display: 'flex'
	},
	content: {
		position: 'relative',
		flex: '1 1 auto',
		display: 'flex',
		flexDirection: 'column',
		border: '1px solid rgba(0,0,0,0.2)',
		boxShadow: '0 0 0.3rem 0 rgba(0,0,0,0.13)',
		borderRadius: '0.4rem',
		overflow: 'hidden',
		'$focus &': {
			[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
				boxShadow: '0 0 2rem 0 rgba(0,67,255,0.43)'
			}
		},
		'$root:not($focus) &:hover': {
			opacity: 0.8
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
			flex: '1 1 auto',
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
		'$focus &': {
			cursor: 'text'
		},
		'& pre': {
			fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
			fontSize: '11px',
			resize: 'none',
			flex: '1 1 auto',
			border: 'none',
			padding: '0.6rem',
			backgroundColor: 'transparent'
		}
	},
	textarea: {
		fontFamily: `'Roboto Mono', 'Courier New', Courier, monospace`,
		fontSize: '11px',
		resize: 'none',
		flex: '1 1 auto',
		border: 'none',
		padding: '0.6rem',
		backgroundColor: 'transparent',
		'$title > &': {
			fontWeight: 500
		},
		'pre&': {
			margin: 0,
			whiteSpace: 'pre-wrap'
		},
		'$focus pre&': {
			display: 'none'
		}
	},
	indent: {
		position: 'absolute',
		top: 0,
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
		[`@media (max-width: ${theme.handleWidthBreakpoint}px)`]: {
			width: '4rem'
		},
		[`@media (max-height: ${theme.handleHeightBreakpoint}px)`]: {
			width: '4rem'
		}
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
		position: 'relative',
		'& > button': {
			color: 'rgba(0,0,0,0.73)',
			fontSize: '1rem',
			fontWeight: 700,
			padding: '0.4rem'
		},
		'& > button:disabled': {
			color: 'rgba(0,0,0,0.47)'
		},
		'& > button:not(:last-child)': {
			marginRight: '2rem'
		},
		'& svg': {
			fontSize: '1.8rem'
		},
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
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
		'& button:nth-child(2)': {
			marginRight: 'auto'
		},
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			top: '5rem'
		},
		[`@media (max-height: 500px) and (orientation:landscape)`]: {
			display: 'none'
		}
	},
	actionsBottom: {
		'& button:nth-child(2)': {
			marginRight: 'auto'
		},
		'& button:nth-child(3)': {
			position: 'absolute',
			left: '50%',
			transform: 'translateX(-50%)'
		},
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			bottom: 0
		},
		[`@media (max-height: 500px) and (orientation:landscape)`]: {
			display: 'none'
		}
	},
	actionsEnter: {
		margin: 0,
		height: 0,
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			padding: '0 1rem'
		}
	},
	actionsActive: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsEnterDone: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsExit: {
		margin: '0.6rem 0',
		height: theme.actions.height.primary,
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			margin: 0,
			padding: '0.6rem 1rem',
			height: theme.actions.height.responsive
		}
	},
	actionsExitActive: {
		margin: 0,
		height: 0,
		[`@media (max-width: ${theme.actionsBreakpoint}px)`]: {
			padding: '0 1rem'
		}
	},
	checkbox: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: '0.6rem'
	},
	dialogTitle: {
		fontSize: '1.6rem',
		fontWeight: 600,
		color: 'rgba(0,0,0,0.87)'
	},
	dialogText: {
		fontSize: '1.6rem',
		fontWeight: 500,
		fontFamily: 'Montserrat, Arial, sans-serif'
	},
	dialogButton: {
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#2196f3'
	}
});

interface OwnProps {
	fullScreen?: boolean;
	block: BlockData;
	index: number;
	moveBlock: (hoverIndex: number, dragIndex: number) => any;
	onChange: (id: any, prop: keyof BlockData, value: any) => any;
	onAddBefore: (id: any) => any;
	onAddAfter: (id: any) => any;
	onDelete: (id: any) => any;
	onClick: (evt: React.MouseEvent) => any;
	onChangeColor: (evt: React.MouseEvent) => any;
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

type Props = OwnProps & WithStyles<typeof styles> & BlockSourceCollectedProps & BlockTargetCollectedProps;

interface State {
	prepareClick: boolean;
	wWidth: number;
	wHeight: number;
	showDeleteDialog: boolean;
}

class Block extends React.PureComponent<Props, State> {
	public state: State = {prepareClick: false, wWidth: 0, wHeight: 0, showDeleteDialog: false};

	public titleRef = React.createRef<any>();
	public bodyRef = React.createRef<any>();

	public componentDidMount() {
		window.addEventListener('resize', this.updateDimensions);
		this.updateDimensions();
	}

	public componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	public updateDimensions = () => {
		this.setState({wWidth: window.innerWidth, wHeight: window.innerHeight});
	}

	public componentDidUpdate(prevProps: Props) {
		if (!prevProps.isDragging && this.props.isDragging) {
			this.setState({prepareClick: false});
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

	public handleToggleDeleteDialog = (show: boolean) => () => {
		this.setState({showDeleteDialog: show})
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

	public handleMouseDown = () => {
		this.setState({prepareClick: true});
	}

	public handleClick = (evt: any) => {
		if (this.state.prepareClick) {
			this.props.onClick(evt);
			this.setState({prepareClick: false});
		}
	}

	public getActions = () => {
		const {block, onChangeColor} = this.props;

		return [
			{label: 'Move Up', icon: UpIcon, fn: this.handleMoveUp, disabled: false},
			{label: 'Move Down', icon: DownIcon, fn: this.handleMoveDown, disabled: false},
			{label: '+ Above', fn: this.handleAddBefore, disabled: false},
			{label: '+ Below', fn: this.handleAddAfter, disabled: false},
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
			{label: 'Color', icon: ColorIcon, fn: onChangeColor, disabled: false},
			{label: 'Delete', icon: DeleteIcon, fn: this.handleToggleDeleteDialog(true), disabled: false}
		];
	}

	public render() {
		const {
			block,
			classes,
			focus,
			connectDragSource,
			connectDropTarget,
			connectDragPreview,
			isDragging,
			index,
			fullScreen
		} = this.props;

		const actions = this.getActions();

		const actionsTop = [actions[0], actions[2], actions[4], actions[5]];
		const actionsBottom = [actions[1], actions[3], actions[6], actions[7]];

		const tabIndex = index * 2 + 1;

		const actionsTransitionClassNames = {
			enter: classes.actionsEnter,
			enterActive: classes.actionsActive,
			enterDone: classes.actionsEnterDone,
			exit: classes.actionsExit,
			exitActive: classes.actionsExitActive
		};

		let contentElem = (
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
						style={{backgroundColor: hex2rgba(`${block.color}66`)}}
					>
						{focus && (
							<TextareaAutosize
								className={classes.textarea}
								tabIndex={tabIndex + (block.showTitle ? 1 : 0)}
								ref={this.bodyRef}
								value={block.body}
								onChange={this.getInputHandler('body')}
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
		);

		if (!focus && !isMobile.any()) {
			contentElem = connectDragSource(contentElem);
		}

		let elem = (
			<div
				key={block.id}
				className={cls(classes.root, {[classes.focus]: focus})}
				style={{
					paddingLeft: `${block.indent * 4}rem`,
					opacity: isDragging ? 0 : 1,
					cursor: isDragging ? 'grabbing' : 'pointer'
				}}
				onMouseDown={this.handleMouseDown}
				onClick={this.handleClick}
			>
				<div className={classes.indent} style={{left: 0, transform: 'translateX(-100%)'}}>
					<button onClick={this.handleDecreaseIndent}>
						<IndentDecIcon/>
					</button>
				</div>
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
				<div className={classes.outerContent}>
					{contentElem}
				</div>
				<CSSTransition
					in={focus}
					key={`${block.id}-bottom`}
					classNames={actionsTransitionClassNames}
					timeout={0}
				>
					<div className={cls(classes.actions, classes.actionsBottom)}>
						{actionsBottom.map(a => a.icon ? (
							<IconButton key={a.label} onClick={a.fn} disabled={a.disabled}>
								<a.icon/>
							</IconButton>
						) : (
							<button key={a.label} onClick={a.fn} disabled={a.disabled}>{a.label}</button>
						))}
					</div>
				</CSSTransition>
				<div className={classes.indent} style={{right: 0, transform: 'translateX(100%)'}}>
					<button onClick={this.handleIncreaseIndent}>
						<IndentIncIcon/>
					</button>
				</div>
				<Dialog
					fullScreen={fullScreen}
					open={this.state.showDeleteDialog}
					onClose={this.handleToggleDeleteDialog(false)}
					fullWidth
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{'Confirm delete'}</DialogTitle>
					<DialogContent>
						<DialogContentText className={classes.dialogText}>
							This action cannot be reversed. Area you sure you want to delete this block?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleToggleDeleteDialog(false)} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button
							onClick={this.handleDelete}
							color="primary"
							className={classes.dialogButton}
						>
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);

		elem = connectDropTarget(elem);
		elem = connectDragPreview(elem);

		return elem;
	}
}

const StyledBlock = withStyles(styles)(Block);

const dropTarget = DropTarget<OwnProps & {innerRef: React.RefObject<any> | null}, BlockTargetCollectedProps>(
	'block',
	cardTarget,
	connect => ({
		connectDropTarget: connect.dropTarget()
	})
);

const dragSource = DragSource<OwnProps & {innerRef: React.RefObject<any> | null}, BlockSourceCollectedProps>(
	'block',
	cardSource,
	(connect, monitor) => ({
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging()
	})
);

export default dropTarget(dragSource(StyledBlock));
