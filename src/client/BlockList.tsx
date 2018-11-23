import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import cls from 'classnames';
import * as _memoize from 'memoizee';
import Block from './Block';

const memoize = (_memoize as any).default;

const styles = createStyles({
	focus: {},
	wrapper: {
		minHeight: 'calc(100% - 4rem)',
		maxWidth: '60rem',
		width: 'calc(100% - 8rem)',
		borderLeft: '1px solid rgba(0,0,0,0.1)',
		borderRight: '1px solid rgba(0,0,0,0.1)',
		display: 'flex',
		'.print &': {
			width: '60rem',
			minWidth: '60rem',
			borderLeft: '1px solid rgba(0,0,0,0)',
			borderRight: '1px solid rgba(0,0,0,0)'
		},
		'@media print': {
			borderLeft: '1px solid rgba(0,0,0,0)',
			borderRight: '1px solid rgba(0,0,0,0)'
		}
	},
	root: {
		width: '100%',
		position: 'relative',
		padding: '0.4rem 1rem 60vh 1rem',
		display: 'flex',
		flexDirection: 'column',
		boxSizing: 'border-box',
		'.print &': {
			padding: '0rem 1rem 0rem 1rem'
		},
		'@media print': {
			padding: '0rem 1rem 0rem 1rem'
		},
		'&$focus': {
			'@media (max-width: 500px)': {
				paddingTop: '5rem'
			}
		}
	},
	listActions: {
		marginTop: '0.6rem',
		textAlign: 'right',
		'.print &': {
			display: 'none'
		},
		'@media print': {
			display: 'none'
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
}

interface Props extends WithStyles<typeof styles> {
	blocks: BlockData[];
	onChange: (blocks: BlockData[]) => any;
	export?: boolean;
}

interface State {
	focusedBlock: any;
}

class BlockList extends React.Component<Props, State> {
	public state = {
		focusedBlock: -1
	};

	public getBlock = memoize(
		(block: BlockData, index: number, focused: boolean, exp?: boolean) => (
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
				export={exp}
			/>
		),
		{normalizer: (args: any) => JSON.stringify(args)}
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
			const prevColor = blocks.length > 0 ? blocks[blocks.length - 1].color : '#ffcc88';
			blocks.splice(index, 0, {
				id,
				title: '',
				body: '',
				showTitle: true,
				showBody: false,
				color: prevColor,
				indent: 0
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

	public render() {
		const {classes, blocks} = this.props;
		return (
			<div className={classes.wrapper}>
				<div className={cls(classes.root, {[classes.focus]: this.state.focusedBlock !== -1})}>
					{blocks.map((block, index) =>
						this.getBlock(block, index, block.id === this.state.focusedBlock, this.props.export)
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
