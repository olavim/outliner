import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {createStyles, WithStyles, withStyles, CircularProgress} from '@material-ui/core';
import cls from 'classnames';
import html2pdf from 'html2pdf.js';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents';
import WebFont from 'webfontloader';
import githubIcon from './github-32px.png';
import BlockList, {BlockData} from './BlockList';

const styles = createStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'center',
		height: '100%',
		backgroundColor: '#fafafa'
	},
	header: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 5rem',
		padding: '0 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		boxShadow: '0 0 0.6rem 0 #00000066',
		zIndex: 100,
		'@media only print': {
			display: 'none'
		}
	}	,
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
		alignItems: 'baseline',
		'&.print': {
			// flex: '0 0 0px'
		},
		'@media print': {
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
	},
	progressOverlay: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		backgroundColor: '#ffffffaa',
		zIndex: 500
	}
});

interface State {
	logs: string[];
	loaded: boolean;
	fontsLoaded: boolean;
	blocks: BlockData[];
	exporting: boolean;
}

class App extends React.Component<WithStyles<typeof styles>, State> {
	public listRef = React.createRef<any>();

	public state: State = {
		logs: [],
		fontsLoaded: false,
		loaded: false,
		blocks: [],
		exporting: false
	};

	public componentDidMount() {
		if (
			'serviceWorker' in navigator &&
			window.location.protocol === 'https:'
			// Sw is disabled in localhost because of hmr
			// (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
		) {
			const registration = runtime.register();

			registerEvents(registration, {
				onInstalled: () => {
					this.pushLog('onInstalled');
				},
				onUpdateReady: () => {
					this.pushLog('onUpdateReady');
				},
				onUpdating: () => {
					this.pushLog('onUpdating');
				},
				onUpdateFailed: () => {
					this.pushLog('onUpdateFailed');
				},
				onUpdated: () => {
					this.pushLog('onUpdated');
				}
			});
		} else {
			this.pushLog('serviceWorker not available');
		}

		WebFont.load({
			google: {
				families: ['Montserrat:500,700', 'Roboto Mono:400,500']
			},
			active: () => {
				this.setState({fontsLoaded: true});
			}
		});

		const data = localStorage.getItem('outliner-data');
		if (data) {
			const blocks = JSON.parse(data);
			this.setState({blocks: blocks.filter(Boolean), loaded: true});
		}
	}

	public componentDidUpdate(_prevProps: any, prevState: State) {
		if (!prevState.fontsLoaded && this.state.fontsLoaded) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					const elem = findDOMNode(this.listRef.current) as HTMLElement;
					if (elem) {
						elem.scrollTo(0, 0);
					}
				});
			}, 0);
		}
	}

	public pushLog = (log: string) => {
		this.setState({logs: [...this.state.logs, log]});
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
		this.setState({exporting: true}, () => {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					const elem = document.getElementById('visible-content');
					if (elem) {
						const opts = {
							filename: 'outline.pdf',
							pagebreak: {avoid: 'div'}
						};
						html2pdf().set(opts).from(elem).save()
							.then(() => {
								this.setState({exporting: false});
							})
							.catch((err: any) => {
								console.error(err);
							});
					}
				});
			}, 0);
		});
	}

	public render() {
		const {classes} = this.props;

		if (!this.state.fontsLoaded) {
			return (
				<div className={classes.progressOverlay}>
					<CircularProgress disableShrink/>
				</div>
			);
		}

		const blockDataString = encodeURIComponent(JSON.stringify(this.state.blocks));
		return (
			<div className={classes.root}>
				{this.state.exporting && (
					<div className={classes.progressOverlay}>
						<CircularProgress disableShrink/>
					</div>
				)}
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
					<a
						href="https://github.com/olavim/outliner"
						target="outliner-github"
						style={{marginLeft: 'auto'}}
					>
						<img src={githubIcon}/>
					</a>
				</div>
				<div className={cls(classes.content, {print: this.state.exporting})} id="visible-content" ref={this.listRef}>
					<BlockList
						blocks={this.state.blocks}
						onChange={this.handleBlocksChange}
					/>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(App);
