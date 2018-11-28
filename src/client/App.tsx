import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {createStyles, WithStyles, withStyles, CircularProgress, List, ListItem, ListItemText, Divider, IconButton, Hidden, Drawer, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from '@material-ui/core';
import withMobileDialog, {InjectedProps as WithMobileDialog} from '@material-ui/core/withMobileDialog';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents';
import WebFont from 'webfontloader';
import MenuIcon from '@material-ui/icons/Menu';
import githubIcon from './github-32px.png';
import BlockList, {BlockData} from './BlockList';
import PDF from '@/lib/create-pdf';

const styles = createStyles({
	root: {
		display: 'flex',
		flexDirection: 'row',
		height: '100%',
		backgroundColor: '#fafafa'
	},
	container: {
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'center',
		flex: 1
	},
	appBar: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 6.4rem',
		padding: '0 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		boxShadow: '0 0 0.6rem 0 #00000066',
		zIndex: 100,
		'& .outline': {
			marginRight: '1rem',
			minHeight: '2.6rem'
		},
		'@media (max-width: 960px)': {
			flex: '0 0 5rem'
		}
	},
	menuButton: {
		'@media (min-width: 960px)': {
			display: 'none'
		}
	},
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
		alignItems: 'baseline'
	},
	uploadWrapper: {
		overflow: 'hidden'
	},
	uploadLabel: {
		width: '100%',
		height: '100%',
		cursor: 'pointer',
		position: 'absolute',
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: 'center',
		top: 0,
		left: 0,
		paddingLeft: '2.4rem',
		'& *': {
			pointerEvents: 'none'
		},
		'@media (max-width: 600px)': {
			paddingLeft: '1.6rem'
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
		zIndex: 2000
	},
	drawer: {
		'@media (min-width: 960px)': {
			width: '22%',
			maxWidth: '24rem',
			minWidth: '15rem'
		}
	},
	drawerContainer: {
		zIndex: 1000,
		'@media (min-width: 960px)': {
			width: '22%',
			maxWidth: '24rem',
			minWidth: '15rem',
			boxShadow: '0 0 2rem 0 #00000022'
		}
	},
	drawerPaper: {
		width: '22%',
		maxWidth: '24rem',
		minWidth: '15rem',
		'@media (max-width: 960px)': {
			width: '24rem'
		}
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: '2.4rem',
		fontWeight: 600,
		fontSize: '2rem',
		height: '6.4rem',
		color: '#0000008a',
		'@media (max-width: 960px)': {
			paddingLeft: '1.6rem',
			height: '5rem'
		}
	},
	drawerItem: {
		paddingTop: 0,
		paddingBottom: 0,
		height: '3.6rem',
		fontSize: '1.3rem',
		fontWeight: 400
	},
	dialogTitle: {
		fontSize: '1.6rem',
		fontWeight: 600,
		color: '#000000de'
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

interface State {
	logs: string[];
	loaded: boolean;
	fontsLoaded: boolean;
	blocks: BlockData[];
	exporting: boolean;
	showDrawer: boolean;
	showNewDialog: boolean;
}

const trimNewLines = (str: string) => {
	return str.replace(/(\n|\r)+$/, '').replace(/^(\n|\r)+/, '');
}

class App extends React.Component<WithMobileDialog & WithStyles<typeof styles>, State> {
	public listRef = React.createRef<any>();

	public state: State = {
		logs: [],
		fontsLoaded: false,
		loaded: false,
		blocks: [],
		exporting: false,
		showDrawer: false,
		showNewDialog: false
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
				families: ['Montserrat:400,600,700', 'Roboto Mono:400,500']
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

	public handleExportPDF = () => {
		this.setState({exporting: true}, () => {
			const ppi = 72;
			const pdf = new PDF({
				pageWidth: 8.3 * ppi,
				pageHeight: 11.7 * ppi,
				indentWidth: 40,
				margin: 0.5 * ppi,
				blockMargin: 0.04 * ppi,
				blockPadding: 0.07 * ppi,
				borderRadius: 4,
				fontSize: 9
			});

			setTimeout(() => {
				window.requestAnimationFrame(() => {
					pdf.export(this.state.blocks.filter(b => b.export))
						.then(() => {
							this.setState({exporting: false});
						});
				});
			}, 0);
		})
	}

	public handleExportText = () => {
		setTimeout(() => {
			window.requestAnimationFrame(() => {
				const blocks = this.state.blocks.filter(b => b.export);
				const blockStrings = blocks.map(b => {
					const parts = [];
					if (b.showTitle) {
						parts.push(trimNewLines(b.title));
					}
					if (b.showBody) {
						parts.push(trimNewLines(b.body));
					}
					return parts.join('\n');
				});
				const str = blockStrings.join('\n\n\n');
				this.downloadData('outline.txt', str);
			});
		}, 0);
	}

	public handleSave = () => {
		this.downloadData('outline.otl', JSON.stringify(this.state.blocks));
	}

	public downloadData = (filename: string, data: string) => {
		const blob = new Blob(['\ufeff', data]);
		const el = document.createElement('a');
		el.href = window.URL.createObjectURL(blob);
		el.download = filename;
		document.body.appendChild(el);
		el.click();
		document.body.removeChild(el);
		window.URL.revokeObjectURL(el.href);
	}

	public handleToggleDrawer = () => {
		this.setState(state => ({showDrawer: !state.showDrawer}));
	}

	public handleOpenNewDialog = () => {
		this.setState({showNewDialog: true});
	}

	public handleCloseNewDialog = () => {
		this.setState({showNewDialog: false});
	}

	public handleNew = () => {
		this.setState({blocks: [], showNewDialog: false});
	}

	public render() {
		const {classes, fullScreen} = this.props;

		if (!this.state.fontsLoaded) {
			return (
				<div className={classes.progressOverlay}>
					<CircularProgress disableShrink/>
				</div>
			);
		}

		const drawer = (
			<div>
				<div className={classes.drawerHeader}>Outlined</div>
				<Divider/>
				<List>
					<ListItem button className={classes.drawerItem} onClick={this.handleOpenNewDialog}>
						<ListItemText primary="New" disableTypography/>
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={this.handleSave}>
						<ListItemText primary="Save" disableTypography/>
					</ListItem>
					<ListItem button className={classes.drawerItem}>
						<input className={classes.uploadInput} type="file" id="file" onChange={this.handleOpenFile}/>
						<label className={classes.uploadLabel} htmlFor="file">Open</label>
					</ListItem>
				</List>
				<Divider/>
				<List>
					<ListItem button className={classes.drawerItem} onClick={this.handleExportPDF}>
						<ListItemText primary="Export PDF" disableTypography/>
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={this.handleExportText}>
						<ListItemText primary="Export Text" disableTypography/>
					</ListItem>
				</List>
			</div>
		);

		return (
			<div className={classes.root}>
				{this.state.exporting && (
					<div className={classes.progressOverlay}>
						<CircularProgress disableShrink/>
					</div>
				)}
				<div className={classes.drawerContainer}>
					<Hidden mdUp implementation="css">
						<Drawer
							variant="temporary"
							anchor="left"
							open={this.state.showDrawer}
							onClose={this.handleToggleDrawer}
							classes={{paper: classes.drawerPaper}}
							ModalProps={{keepMounted: true}}
						>
							{drawer}
						</Drawer>
					</Hidden>
					<Hidden smDown implementation="css">
						<Drawer
							classes={{paper: classes.drawerPaper}}
							variant="permanent"
							open
						>
							{drawer}
						</Drawer>
					</Hidden>
				</div>
				<div className={classes.container}>
					<div className={classes.appBar}>
						<IconButton onClick={this.handleToggleDrawer} className={classes.menuButton}>
							<MenuIcon/>
						</IconButton>
						<IconButton
							style={{marginLeft: 'auto', padding: '1.2rem'}}
							component="a"
							href="https://github.com/olavim/outliner"
							target="github"
						>
							<img src={githubIcon} style={{height: '2.4rem'}}/>
						</IconButton>
					</div>
					<div className={classes.content} ref={this.listRef}>
						<BlockList
							blocks={this.state.blocks}
							onChange={this.handleBlocksChange}
						/>
					</div>
				</div>
				<Dialog
					fullScreen={fullScreen}
					open={this.state.showNewDialog}
					onClose={this.handleCloseNewDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"Confirm new document"}</DialogTitle>
					<DialogContent>
						<DialogContentText className={classes.dialogText}>
							Your current document will be lost. Please save your work before creating a new document
							if you wish to restore it later.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleCloseNewDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button onClick={this.handleNew} color="primary" className={classes.dialogButton} autoFocus>
							OK
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}

export default withMobileDialog()(withStyles(styles)(App));
