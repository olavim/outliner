import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import Block from './Block';

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
	focusedBlock: any;
}

class BlockList extends React.Component<Props, State> {
	public state = {
		focusedBlock: -1
	};

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
			this.props.onChange(blocks);
		}
	};

	public handleChangeBlock = (id: any, prop: keyof BlockData, value: any) => {
		const blocks = this.props.blocks.slice();
		const block = blocks.find(b => b.id === id);
		if (block) {
			block[prop] = value;
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
		const blocks = this.props.blocks.slice();
		const dragBlock = blocks[dragIndex];
		blocks.splice(dragIndex, 1);
		blocks.splice(hoverIndex, 0, dragBlock);
		this.props.onChange(blocks);
	}

	public render() {
		const {classes} = this.props;
		return (
			<div className={classes.wrapper}>
				<div className={classes.root}>
					{this.props.blocks.map((block, index) => {
						return (
							<Block
								key={block.id}
								index={index}
								block={block}
								onChange={this.handleChangeBlock}
								presetColors={this.getPresetColors()}
								onAddBefore={this.handleAddBefore}
								onAddAfter={this.handleAddAfter}
								onDelete={this.handleDelete}
								showActions={this.state.focusedBlock === block.id}
								onClick={this.handleFocusBlock(block.id)}
								moveBlock={this.handleMoveBlock}
							/>
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
