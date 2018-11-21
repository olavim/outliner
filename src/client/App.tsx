import * as React from 'react';
import {createStyles, WithStyles, withStyles} from '@material-ui/core';
import cls from 'classnames';
import html2pdf from 'html2pdf.js';
import BlockList, {BlockData} from './BlockList';

const styles = createStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'center',
		height: '100%'
	},
	header: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 4rem',
		padding: '0.6rem 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		borderBottom: '1px solid rgba(0,0,0,0.1)',
		'@media only print': {
			display: 'none'
		}
	}	,
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
		overflowY: 'auto',
		alignItems: 'baseline',
		'@media only print': {
			overflowY: 'visible'
		}
	},
	uploadWrapper: {
		marginRight: '1rem',
		position: 'relative',
		overflow: 'hidden',
		minHeight: '2.4rem'
	},
	uploadLabel: {
		cursor: 'pointer',
		'& *': {
			pointerEvents: 'none'
		}
	},
	uploadInput: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '6rem',
		height: '2.4rem',
		opacity: 0,
		zIndex: -1,
		cursor: 'pointer'
	}
});

interface State {
	blocks: BlockData[];
}

class App extends React.Component<WithStyles<typeof styles>, State> {
	public state: State = {
		blocks: []
	};

	public componentDidMount() {
		const data = localStorage.getItem('outliner-data');
		if (data) {
			this.setState({blocks: JSON.parse(data)});
		}
	}

	public handleBlocksChange = (blocks: BlockData[]) => {
		localStorage.setItem('outliner-data', JSON.stringify(blocks));
		this.setState({blocks});
	}

	public handleOpenFile = () => {
		const fileElem = document.getElementById('file') as HTMLInputElement | null;
		if (fileElem && fileElem.files && fileElem.files[0]) {
			const file = fileElem.files[0];
			const reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = () => {
				const data = reader.result as string;
				localStorage.setItem('outliner-data', data);
				this.setState({blocks: JSON.parse(data)});
			};
		}
	}

	public handleExport = () => {
		const elem = document.getElementById('block-content');
		if (elem) {
			elem.classList.add('print');
			const opts = {
				filename: 'outline.pdf',
				pagebreak: {avoid: 'div'}
			};
			html2pdf().set(opts).from(elem).save().then(() => {
				elem.classList.remove('print');
			});
		}
	}

	public render() {
		const {classes} = this.props;
		const blockDataString = encodeURIComponent(JSON.stringify(this.state.blocks));
		return (
			<div className={classes.root}>
				<div className={classes.header}>
					<div className={cls('outline', classes.uploadWrapper)}>
						<input className={classes.uploadInput} type="file" id="file" onChange={this.handleOpenFile}/>
						<label className={classes.uploadLabel} htmlFor="file">open</label>
					</div>
					<a
						className="outline"
						href={`data:text/plain;charset=utf-8,${blockDataString}`}
						download="outline.otl"
						style={{minHeight: '2.4rem', marginRight: '1rem'}}
					>
						save
					</a>
					<button className="outline" onClick={this.handleExport} style={{minHeight: '2.6rem'}}>
						Export PDF
					</button>
				</div>
				<div className={classes.content} id="block-content">
					<BlockList blocks={this.state.blocks} onChange={this.handleBlocksChange}/>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(App);
