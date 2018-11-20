import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import TextareaAutosize from 'react-autosize-textarea';
import {CSSTransition} from 'react-transition-group';
import IndentDec from '@material-ui/icons/KeyboardArrowLeft';
import IndentInc from '@material-ui/icons/KeyboardArrowRight';
import {SketchPicker, ColorResult} from 'react-color';

const styles = createStyles({
	wrapper: {
		minHeight: 'calc(100% - 4rem)',
		borderLeft: '1px solid rgba(0,0,0,0.1)',
		borderRight: '1px solid rgba(0,0,0,0.1)'
	},
	root: {
		position: 'relative',
		width: '60rem',
		padding: '1rem',
		display: 'table',
		boxSizing: 'border-box'
	},
	listActions: {
		textAlign: 'right'
	},
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
	},
	'@media only print': {
		listActions: {
			display: 'none'
		}
	}
})

export interface BlockData {
	id: any;
	title: string;
	body: string;
	showTitle: boolean;
	showBody: boolean;
	color: string;
	indent: number;
}

interface Props extends WithStyles<typeof styles> {
	blocks: BlockData[];
	onChange: (blocks: BlockData[]) => any;
}

interface State {
	showActions: number;
	colorPickerBlock: any;
}

class BlockList extends React.Component<Props, State> {
	public state = {
		showActions: -1,
		colorPickerBlock: -1
	};

	public componentDidMount() {
		window.addEventListener('click', this.handleDocumentClick);
	}

	public componentWillUnmount() {
		window.removeEventListener('click', this.handleDocumentClick);
	}

	public handleDocumentClick = () => {
		this.setState({showActions: -1, colorPickerBlock: -1});
	}

	public getInputHandler = (id: any, prop: 'title' | 'body') => (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block[prop] = evt.target.value;
		}
		this.props.onChange(blocks);
	}

	public handleAddAt = (index: number) => {
		const blocks = this.props.blocks.slice();
		if (index !== -1) {
			const id = new Date().getTime();
			blocks.splice(index, 0, {
				id,
				title: '',
				body: '',
				showTitle: true,
				showBody: false,
				color: this.getPresetColors()[0] || '#ffcc88',
				indent: 0
			});
			this.props.onChange(blocks);
		}
	}

	public handleAddBefore = (id: any) => () => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index);
	};

	public handleAddAfter = (id: any) => () => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index + 1);
	};

	public handleAddEnd = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.handleAddAt(this.props.blocks.length);
	};

	public focusBlock = (id: any) => {
		const block = this.props.blocks.find(b => b.id === id);
		if (block) {
			if (block.showTitle) {
				const textarea = document.getElementById(`block-${id}-title`);
				if (textarea) {
					textarea.focus();
				}
			} else {
				const textarea = document.getElementById(`block-${id}-body`);
				if (textarea) {
					textarea.focus();
				}
			}
		}
	}

	public handleDecreaseIndent = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();

		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block && block.indent > 0) {
			block.indent--;
		}
		this.focusBlock(this.state.showActions);
		this.props.onChange(blocks);
	};

	public handleIncreaseIndent = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();

		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block.indent++;
		}
		this.focusBlock(this.state.showActions);
		this.props.onChange(blocks);
	};

	public handleToggleTitle = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();
		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block.showTitle = !block.showTitle;
			this.focusBlock(id);
			this.props.onChange(blocks);
		}
	};

	public handleToggleBody = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();
		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block.showBody = !block.showBody;
			this.focusBlock(id);
			this.props.onChange(blocks);
		}
	};

	public handleClickBlock = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({colorPickerBlock: -1});
	};

	public handleFocusBlock = (id: any) => (_evt: React.FocusEvent) => {
		this.setState({showActions: id});
	};

	public handleBlurBlock = (_evt: React.FocusEvent) => {
		this.setState({showActions: -1, colorPickerBlock: -1});
	};

	public handleDelete = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();
		const blocks = this.props.blocks.slice();
		const index = blocks.findIndex(b => b.id === id);
		if (index !== -1) {
			blocks.splice(index, 1);
			this.props.onChange(blocks);
		}
	};

	public handleClickColorPicker = (evt: React.MouseEvent) => {
		evt.stopPropagation();
	};

	public handleOpenColorPicker = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({colorPickerBlock: id});
	};

	public handleChangeColor = (id: any) => (color: ColorResult) => {
		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block.color = color.hex;
			this.props.onChange(blocks);
		}
	};

	public getPresetColors = () => {
		const set = new Set(this.props.blocks.map(b => b.color));
		return Array.from(set);
	}

	public render() {
		const {classes} = this.props;
		return (
			<div className={classes.wrapper}>
				<div className={classes.root}>
					{this.props.blocks.map(block => {
						return (
							<div
								key={block.id}
								className={classes.block}
								style={{paddingLeft: `${block.indent * 4}rem`}}
							>
								<div className={classes.actionsLeft}>
									<button onClick={this.handleDecreaseIndent(block.id)}>
										<IndentDec/>
									</button>
								</div>
								<div className={classes.content}>
									{block.showTitle && (
										<div
											className={classes.title}
											style={{backgroundColor: block.color}}
										>
											<TextareaAutosize
												id={`block-${block.id}-title`}
												value={block.title}
												onChange={this.getInputHandler(block.id, 'title')}
												onFocus={this.handleFocusBlock(block.id)}
												onClick={this.handleClickBlock}
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
												id={`block-${block.id}-body`}
												value={block.body}
												onChange={this.getInputHandler(block.id, 'body')}
												onFocus={this.handleFocusBlock(block.id)}
												onClick={this.handleClickBlock}
												spellCheck={false}
												style={{minHeight: '27px'}}
												autoFocus
											/>
										</div>
									)}
									<CSSTransition
										in={this.state.showActions === block.id}
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
										<div className={classes.blockActions} onClick={this.handleClickBlock}>
											<button onClick={this.handleAddBefore(block.id)}>{'Add Before'}</button>
											<button onClick={this.handleOpenColorPicker(block.id)}>{'Color'}</button>
											<button
												onClick={this.handleToggleTitle(block.id)}
												disabled={!block.showBody}
											>
												{block.showTitle ? 'Remove Title' : 'Add Title'}
											</button>
											<button
												onClick={this.handleToggleBody(block.id)}
												disabled={!block.showTitle}
											>
												{block.showBody ? 'Remove Body' : 'Add Body'}
											</button>
											<button onClick={this.handleDelete(block.id)}>{'Delete'}</button>
											<button onClick={this.handleAddAfter(block.id)}>{'Add After'}</button>
										</div>
									</CSSTransition>
								</div>
								<div className={classes.actionsRight}>
									<button onClick={this.handleIncreaseIndent(block.id)}>
										<IndentInc/>
									</button>
								</div>
								<div
									className={classes.color}
									style={{display: this.state.colorPickerBlock === block.id ? 'block' : 'none'}}
									onClick={this.handleClickColorPicker}
								>
									<SketchPicker
										disableAlpha
										color={block.color}
										onChange={this.handleChangeColor(block.id)}
										presetColors={this.getPresetColors()}
									/>
								</div>
							</div>
						);
					})}
					<div className={classes.listActions}>
						<button className="outline" onClick={this.handleAddEnd}>
							Add Block
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(BlockList);
