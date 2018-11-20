import * as React from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import {CSSTransition} from 'react-transition-group';
import IndentDec from '@material-ui/icons/KeyboardArrowLeft';
import IndentInc from '@material-ui/icons/KeyboardArrowRight';
import {SketchPicker, ColorResult} from 'react-color';
import './BlockList.css';

export interface BlockData {
	id: any;
	title: string;
	body: string;
	showTitle: boolean;
	showBody: boolean;
	color: string;
	indent: number;
}

interface Props {
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
		return (
			<div className="BlockList-wrapper">
				<div className="BlockList">
					{this.props.blocks.map(block => {
						return (
							<div
								key={block.id}
								className="Block"
								style={{paddingLeft: `${block.indent * 4}rem`}}
							>
								<div className="Block-actions-left">
									<button onClick={this.handleDecreaseIndent(block.id)}>
										<IndentDec/>
									</button>
								</div>
								<div className="Block-content">
									{block.showTitle && (
										<div
											className="Block-title"
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
											className="Block-text"
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
										classNames="Block-actions"
										timeout={0}
									>
										<div className="Block-actions" onClick={this.handleClickBlock}>
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
								<div className="Block-actions-right">
									<button onClick={this.handleIncreaseIndent(block.id)}>
										<IndentInc/>
									</button>
								</div>
								<div
									className="BlockList-color"
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
					<div className="BlockList-actions">
						<button className="outline BlockList-add" onClick={this.handleAddEnd}>
							Add Block
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default BlockList;
