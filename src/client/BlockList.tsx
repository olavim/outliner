import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import Block from './Block';

const styles = createStyles({
	wrapper: {
		minHeight: 'calc(100% - 4rem)',
		height: 'fit-content',
		maxWidth: '60rem',
		width: 'calc(100% - 10rem)',
		borderLeft: '1px solid rgba(0,0,0,0.1)',
		borderRight: '1px solid rgba(0,0,0,0.1)',
		display: 'flex',
		'.print &': {
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
		display: 'table',
		flexDirection: 'column',
		boxSizing: 'border-box',
		'.print &': {
			padding: '0rem 1rem 0rem 1rem'
		},
		'@media print': {
			padding: '0rem 1rem 0rem 1rem'
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
			}, 50);
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
