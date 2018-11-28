import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import cls from 'classnames';
import * as _memoize from 'memoizee';
import Block from './Block';
import Checkbox from '@/Checkbox';

const memoize = (_memoize as any).default;

const styles = createStyles({
	focus: {},
	wrapper: {
		minHeight: 'calc(100% - 4rem)',
		maxWidth: '60rem',
		width: 'calc(100% - 6rem)',
		display: 'flex',
		flexDirection: 'column',
		'@media (min-width: 960px)': {
			borderLeft: '1px dotted rgba(0,0,0,0.1)',
			borderRight: '1px dotted rgba(0,0,0,0.1)',
			width: 'calc(100% - 8rem)'
		},
		'&$focus': {
			'@media (max-width: 960px)': {
				paddingTop: '5rem'
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
			color: '#000000de'
		}
	},
	checkbox: {
		margin: '0.5rem',
		border: '2px solid #00ccff'
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
	blocks: BlockData[];
	onChange: (blocks: BlockData[]) => any;
}

interface State {
	focusedBlock: any;
	exportAllChecked: boolean;
}

class BlockList extends React.Component<Props, State> {
	public state: State = {
		focusedBlock: -1,
		exportAllChecked: this.props.blocks.some(b => b.export)
	};

	public getBlock = memoize(
		(block: BlockData, index: number, focused: boolean) => (
			<Block
				key={block.id}
				index={index}
				block={block}
				onChange={this.handleChangeBlock}
				presetColors={this.getPresetColors()}
				onAddBefore={this.handleAddBefore}
				onAddAfter={this.handleAddAfter}
				onDelete={this.handleDelete}
				focus={focused}
				onClick={this.handleFocusBlock(block.id)}
				moveBlock={this.handleMoveBlock}
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

	public handleDocumentClick = () => {
		this.setState({focusedBlock: -1});
	}

	public handleAddAt = (index: number) => {
		const blocks = this.props.blocks.slice();
		if (index !== -1) {
			const id = new Date().getTime();
			const prevColor =
				index > 0 ? blocks[index - 1].color :
				index < blocks.length - 1 ? blocks[index].color :
				'#ffcc88';

			blocks.splice(index, 0, {
				id,
				title: '',
				body: '',
				showTitle: true,
				showBody: false,
				color: prevColor,
				indent: index > 0 ? blocks[index - 1].indent : 0,
				export: true
			});
			setTimeout(() => {
				this.setState({focusedBlock: id});
			}, 50);
			this.props.onChange(blocks);
		}
	}

	public handleAddBefore = (id: any) => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index);
	};

	public handleAddAfter = (id: any) => {
		const index = this.props.blocks.findIndex(b => b.id === id);
		this.handleAddAt(index + 1);
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
		this.setState({focusedBlock: id});
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
		const checked = this.state.exportAllChecked;
		const blocks = this.props.blocks.map(block => ({
			...block,
			export: !checked
		}));
		this.props.onChange(blocks);

		this.setState({exportAllChecked: !checked});
	}

	public render() {
		const {classes, blocks} = this.props;
		return (
			<div className={cls(classes.wrapper, {[classes.focus]: this.state.focusedBlock !== -1})}>
				<div className={classes.checkboxContainer}>
					<span>Enable for Export</span>
					<Checkbox
						className={classes.checkbox}
						checked={this.state.exportAllChecked}
						onClick={this.handleClickExportAll}
					/>
				</div>
				<div className={classes.root}>
					{blocks.map((block, index) =>
						this.getBlock(block, index, block.id === this.state.focusedBlock)
					)}
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
