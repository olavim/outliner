import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import cls from 'classnames';
import * as _memoize from 'memoizee';
import Block from './Block';
import Checkbox from '@/Checkbox';
import {ColorState, SketchPicker as _SketchPicker} from 'react-color';

const SketchPicker = _SketchPicker as any;
const memoize = (_memoize as any).default;

const styles = createStyles({
	focus: {},
	wrapper: {
		minHeight: 'calc(100% - 4rem)',
		maxWidth: '60rem',
		width: 'calc(100% - 6rem)',
		display: 'flex',
		flexDirection: 'column',
		transition: 'padding 0.2s, margin 0.2s',
		'@media (min-width: 960px)': {
			borderLeft: '1px dotted rgba(0,0,0,0.1)',
			borderRight: '1px dotted rgba(0,0,0,0.1)',
			width: 'calc(100% - 8rem)'
		},
		'&$focus': {
			'@media (max-width: 960px)': {
				paddingTop: '5rem'
			},
			'@media (max-height: 500px) and (orientation:landscape)': {
				paddingTop: 'inherit',
				width: 'calc(100% - 12rem)'
			}
		}
	},
	root: {
		width: '100%',
		position: 'relative',
		padding: '0.4rem 1rem 60vh 1rem',
		display: 'flex',
		flexDirection: 'column',
		boxSizing: 'border-box'
	},
	listActions: {
		marginTop: '0.6rem',
		textAlign: 'right'
	},
	checkboxContainer: {
		position: 'relative',
		height: '3.2rem',
		display: 'flex',
		marginTop: '1rem',
		padding: '0 1rem',
		justifyContent: 'flex-end',
		alignItems: 'center',
		'& > span': {
			marginRight: '0.6rem',
			color: 'rgba(0,0,0,0.87)'
		}
	},
	checkboxRoot: {
		margin: '0.5rem',
	},
	checkbox: {
		border: '2px solid #00ccff'
	},
	colorChooser: {
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2000
	},
	colorChooserComponent: {
		zIndex: 5
	},
	colorChooserContent: {
		display: 'flex',
		flexDirection: 'row',
		maxWidth: '60rem',
		width: '60rem',
		padding: '2rem',
		borderRadius: '0.5rem',
		overflow: 'hidden',
		boxShadow: '0 0 20rem 0 #000000',
		position: 'relative',
		'@media (max-width: 760px)': {
			width: 'auto',
			height: '32rem',
			flexDirection: 'column-reverse'
		}
	},
	colorPreview: {
		display: 'flex',
		flexDirection: 'column',
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: '#fafafa',
		borderRadius: '1rem',
		'& > div:first-child': {
			flex: 0.5,
			width: '100%'
		},
		'& > div:last-child': {
			flex: '1 1 auto',
			width: '100%'
		}
	}
});

export interface BlockData {
	id: any;
	title: string;
	body: string;
	showTitle: boolean;
	showBody: boolean;
	color: string;
	indent: number;
	export: boolean;
}

interface Props extends WithStyles<typeof styles> {
	fullScreen?: boolean;
	blocks: BlockData[];
	onChange: (blocks: BlockData[]) => any;
	onFocusBlock: (ref: React.RefObject<any>) => void;
}

interface State {
	focusedBlock: any;
	showColorPicker: any;
}

class BlockList extends React.Component<Props, State> {
	public state: State = {
		focusedBlock: -1,
		showColorPicker: null
	};

	public focusedBlockRef = React.createRef<any>();

	public getBlock = memoize(
		(block: BlockData, index: number, focused: boolean, fullScreen?: boolean) => (
			<Block
				key={block.id}
				index={index}
				fullScreen={fullScreen}
				onChange={this.handleChangeBlock}
				block={block}
				onAddBefore={this.handleAddBefore}
				onAddAfter={this.handleAddAfter}
				onDelete={this.handleDelete}
				focus={focused}
				onClick={this.handleFocusBlock(block.id)}
				onChangeColor={this.handleOpenColorPicker}
				moveBlock={this.handleMoveBlock}
				innerRef={focused ? this.focusedBlockRef : null}
			/>
		),
		{normalizer: (args: any) => args[2] ? Date.now() : JSON.stringify(args)}
	);

	public componentDidMount() {
		window.addEventListener('click', this.handleDocumentClick);
	}

	public componentWillUnmount() {
		window.removeEventListener('click', this.handleDocumentClick);
	}

	public handleDocumentClick = (evt: any) => {
		this.handleFocusBlock(-1)(evt);
	}

	public handleAddAt = (index: number, parentBlock: BlockData | null = null) => {
		const blocks = this.props.blocks.slice();
		if (index !== -1) {
			const id = new Date().getTime();

			blocks.splice(index, 0, {
				id,
				title: '',
				body: '',
				showTitle: parentBlock ? parentBlock.showTitle : true,
				showBody: parentBlock ? parentBlock.showBody : false,
				color: parentBlock ? parentBlock.color : '#ffcc88',
				indent: parentBlock ? parentBlock.indent : 0,
				export: parentBlock ? parentBlock.export : true
			});
			setTimeout(() => {
				this.setState({focusedBlock: id});
			}, 50);
			this.props.onChange(blocks);
		}
	}

	public handleAddBefore = (id: any) => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index, this.props.blocks[index]);
	};

	public handleAddAfter = (id: any) => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index + 1, this.props.blocks[index]);
	};

	public handleAddEnd = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.handleAddAt(this.props.blocks.length);
	};

	public handleDelete = (id: any) => {
		const blocks = this.props.blocks.slice();
		const index = blocks.findIndex(b => b.id === id);
		if (index !== -1) {
			blocks.splice(index, 1);
			setTimeout(() => {
				if (blocks.length > 0) {
					const newIndex = index <= blocks.length - 1 ? index : blocks.length - 1;
					this.setState({focusedBlock: blocks[newIndex].id});
				}
			}, 10);
			this.props.onChange(blocks);
		}
	};

	public handleChangeBlock = (id: any, prop: keyof BlockData, value: any) => {
		const blocks = this.props.blocks.slice();
		const index = blocks.findIndex(b => b.id === id);
		if (index !== -1) {
			const newBlock = Object.assign({}, blocks[index], {[prop]: value});
			blocks[index] = newBlock;
			this.props.onChange(blocks);
		}
	}

	public getPresetColors = () => {
		const set = new Set(this.props.blocks.map(b => b.color));
		return Array.from(set);
	}

	public handleFocusBlock = (id: any) => (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({focusedBlock: id}, () => {
			this.props.onFocusBlock(this.focusedBlockRef);
		});
	}

	public handleOpenColorPicker = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({showColorPicker: true});
	}

	public handleCloseColorPicker = (evt: React.MouseEvent) => {
		evt.stopPropagation();
		this.setState({showColorPicker: false});
	}

	public handleChangeBlockColor = (color: ColorState) => {
		const focusedBlock = this.props.blocks.find(b => b.id === this.state.focusedBlock);
		if (focusedBlock) {
			this.handleChangeBlock(focusedBlock.id, 'color', color.hex);
		}
	}

	public handleMoveBlock = (dragIndex: any, hoverIndex: any) => {
		const {blocks, onChange} = this.props;
		if (dragIndex >= 0 && hoverIndex >= 0 && dragIndex < blocks.length && hoverIndex < blocks.length) {
			const newBlocks = blocks.slice();
			const dragBlock = newBlocks[dragIndex];
			newBlocks.splice(dragIndex, 1);
			newBlocks.splice(hoverIndex, 0, dragBlock);
			onChange(newBlocks);
		}
	}

	public handleClickExportAll = () => {
		const checked = this.props.blocks.every(b => b.export);
		const blocks = this.props.blocks.map(block => ({
			...block,
			export: !checked
		}));
		this.props.onChange(blocks);
	}

	public render() {
		const {classes, blocks, fullScreen} = this.props;
		const focusedBlock = blocks.find(b => b.id === this.state.focusedBlock);
		const exportAllChecked = blocks.every(b => b.export);

		return (
			<div className={cls(classes.wrapper, {[classes.focus]: this.state.focusedBlock !== -1})}>
				<div className={classes.checkboxContainer}>
					<span>Export All</span>
					<Checkbox
						classNames={{root: classes.checkboxRoot, checkbox: classes.checkbox}}
						checked={exportAllChecked}
						onClick={this.handleClickExportAll}
					/>
				</div>
				<div className={classes.root}>
					{blocks.map((block, index) =>
						this.getBlock(block, index, block.id === this.state.focusedBlock, fullScreen)
					)}
					<div className={classes.listActions}>
						<button className="outline" onClick={this.handleAddEnd}>
							Add Block
						</button>
					</div>
				</div>
				{focusedBlock && (
					<div
						className={classes.colorChooser}
						style={{display: this.state.showColorPicker ? 'flex' : 'none'}}
						onClick={this.handleCloseColorPicker}
					>
						<div className={classes.colorChooserContent} onClick={this.handleOpenColorPicker}>
							<SketchPicker
								disableAlpha
								color={focusedBlock.color}
								onChange={this.handleChangeBlockColor}
								presetColors={this.getPresetColors()}
								className={classes.colorChooserComponent}
							/>
							<div className={classes.colorPreview}>
								<div style={{backgroundColor: focusedBlock.color}} />
								<div style={{backgroundColor: `${focusedBlock.color}66`}} />
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(styles)(BlockList);
