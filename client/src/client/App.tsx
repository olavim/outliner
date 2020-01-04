import * as React from 'react';
import {findDOMNode} from 'react-dom';
import axios, {AxiosInstance} from 'axios';
import {cloneDeep, pick, debounce} from 'lodash';
import {
	createStyles,
	WithStyles,
	withStyles,
	CircularProgress,
	IconButton,
	Button,
	Fab,
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	DialogActions
} from '@material-ui/core';
import withMobileDialog, {InjectedProps as WithMobileDialog} from '@material-ui/core/withMobileDialog';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import WebFont from 'webfontloader';
import FileSaver from 'file-saver';
import MenuIcon from '@material-ui/icons/Menu';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import FileTreeIcon from '@material-ui/icons/FolderOpen';
import DownloadIcon from '@material-ui/icons/GetApp';
import githubIcon from './github-32px.png';
import BlockList, {BlockData} from './BlockList';
import PDF from '@/lib/create-pdf';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';
import isMobile from '@/lib/is-mobile';
import MenuDrawer from '@/MenuDrawer';
import FileTreeDrawer from '@/FileTreeDrawer';

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
		flex: '1 1 auto'
	},
	appBar: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 5rem',
		padding: '0 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		boxShadow: '0 0 0.6rem 0 rgba(0,0,0,0.4)',
		zIndex: 100,
		'& .outline': {
			marginRight: '1rem',
			minHeight: '2.6rem'
		},
		[`@media (max-height: 500px) and (orientation:landscape)`]: {
			padding: '0 1rem'
		}
	},
	menuButton: {
		padding: '0.6rem',
		'@media (min-width: 960px)': {
			display: 'none'
		}
	},
	fileTreeButton: {
		padding: '0.6rem',
		'@media (min-width: 960px)': {
			display: 'none'
		}
	},
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: '1 1 auto',
		overflowY: 'scroll',
		overflowX: 'hidden',
		alignItems: 'baseline'
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
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		zIndex: 2000
	},
	drawerContainer: {
		zIndex: 1000,
		'@media (min-width: 960px)': {
			width: '22%',
			maxWidth: '24rem',
			minWidth: '15rem',
			boxShadow: '0 0 2rem 0 rgba(0,0,0,0.13)'
		}
	},
	dialogTitle: {
		fontSize: '1.6rem',
		fontWeight: 600,
		color: 'rgba(0,0,0,0.87)'
	},
	dialogButton: {
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#2196f3'
	},
	noDocumentContainer: {
		padding: '5rem',
		'& button': {
			backgroundColor: '#5e8fc5',
			fontSize: '1.2rem',
			color: '#fff',
			fontWeight: 600,
			'&:hover': {
				backgroundColor: '#6596cc'
			},
			'& svg': {
				marginRight: '0.8rem'
			}
		}
	},
	downloadDialog: {
		backgroundColor: 'transparent',
		overflowY: 'visible',
		boxShadow: 'none',
		'& button': {
			backgroundColor: '#5e8fc5',
			fontSize: '1.2rem',
			color: '#fff',
			fontWeight: 600,
			'&:hover': {
				backgroundColor: '#6596cc'
			},
			'& svg': {
				marginRight: '0.8rem'
			}
		}
	},
	blockActionContainer: {
		margin: '0 1rem',
		padding: '0',
		display: 'none',
		flex: '1 1 auto',
		borderLeft: '1px solid rgba(0, 0, 0, 0.11)',
		borderRight: '1px solid rgba(0, 0, 0, 0.11)',
		justifyContent: 'space-around',
		[`@media (max-height: 500px) and (orientation:landscape)`]: {
			display: 'flex'
		}
	},
	blockAction: {
		backgroundColor: 'transparent',
		fontSize: '1rem',
		border: 'none',
		fontWeight: 700,
		color: 'rgba(0,0,0,0.73)',
		flex: '0 1 0',
		padding: '9px 0.2rem',
		'&:disabled': {
			color: 'rgba(0,0,0,0.47)'
		},
		'& svg': {
			fontSize: '1.8rem'
		}
	}
});

export interface ListOutline {
	id: string;
	name: string;
	createdAt: string;
	updatedAt?: string;
}

export interface GetOutline {
	data: BlockData[];
	id?: string;
	name?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface State {
	fontsLoaded: boolean;
	outline?: GetOutline;
	availableOutlines: ListOutline[];
	nameStr: string;
	loading: boolean;
	exporting: boolean;
	showDrawer: boolean;
	showFileTree: boolean;
	showOpenDialog: boolean;
	showRenameDialog: boolean;
	showNewDialog: boolean;
	showConfirmDialog: boolean;
	downloadData: {blob: Blob; filename: string} | null;
	appBarActions: any[];
}

const trimNewLines = (str: string) => {
	return str.replace(/(\n|\r)+$/, '').replace(/^(\n|\r)+/, '');
}

type AppProps = WithMobileDialog & WithStyles<typeof styles> & WithAuthProps;

class App extends React.Component<AppProps, State> {
	public listContainerRef = React.createRef<any>();
	public listRef = React.createRef<any>();
	public api: AxiosInstance;

	public state: State = {
		fontsLoaded: false,
		availableOutlines: [],
		nameStr: '',
		loading: true,
		exporting: false,
		showDrawer: false,
		showFileTree: false,
		showOpenDialog: false,
		showRenameDialog: false,
		showNewDialog: false,
		showConfirmDialog: false,
		downloadData: null,
		appBarActions: []
	};

	constructor(props: AppProps) {
		super(props);
		this.api = axios.create({
			baseURL: window.env.API_URL
		});
		this.api.interceptors.request.use(async config => {
			const token = await this.props.auth.getTokenSilently();
			config.headers = {Authorization: `Bearer ${token}`};
			return config;
		});
	}

	public componentDidMount() {
		if (
			'serviceWorker' in navigator &&
			window.location.protocol === 'https:'
			// Sw is disabled in localhost because of hmr
			// (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
		) {
			runtime.register();
		}

		WebFont.load({
			google: {
				families: ['Montserrat:400,600,700', 'Roboto Mono:400,500']
			},
			active: () => {
				this.setState({fontsLoaded: true});
			}
		});

		if (this.props.auth.isAuthenticated) {
			this.handleList(true);
		} else {
			const data = localStorage.getItem('outliner-data');
			this.setState({outline: data ? JSON.parse(data) : {data: []}, loading: false});
		}
	}

	public componentDidUpdate(_prevProps: any, prevState: State) {
		if (!prevState.fontsLoaded && this.state.fontsLoaded) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					const elem = findDOMNode(this.listContainerRef.current) as HTMLElement;
					if (elem) {
						elem.scrollTo(0, 0);
					}
				});
			}, 0);
		}
	}

	public handleBlocksChange = (data: BlockData[]) => {
		const outline = cloneDeep(this.state.outline);
		outline!.data = data;

		if (this.props.auth.isAuthenticated) {
			this.handleSave();
		} else {
			localStorage.setItem('outliner-data', JSON.stringify(outline));
		}

		this.setState({outline});
	}

	public handleImportOutline = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const fileElem = evt.target;
		if (fileElem && fileElem.files && fileElem.files[0]) {
			const file = fileElem.files[0];
			const reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = async () => {
				const data = reader.result as string;
				const newOutline = {
					name: file.name.replace(/\.[^/.]+$/, '') || 'untitled',
					data: JSON.parse(data)
				};

				let outline: GetOutline;

				if (this.props.auth.isAuthenticated) {
					const {data} = await this.api.post('/outlines', newOutline);
					outline = data.outline;
				} else {
					outline = newOutline;
				}

				this.setState({outline, showDrawer: false}, () => {
					localStorage.setItem('outliner-data', JSON.stringify(outline));

					if (this.props.auth.isAuthenticated) {
						this.handleList();
					}
				});
			};
		}
	}

	public handleExportPDF = (width: number, height: number, margin: number) => {
		this.setState({exporting: true}, () => {
			const ppi = 72;
			const pdf = new PDF({
				pageWidth: width * ppi,
				pageHeight: height * ppi,
				indentWidth: 40,
				margin: margin * ppi,
				blockMargin: 0.04 * ppi,
				blockPadding: 0.07 * ppi,
				borderRadius: 4,
				fontSize: 9
			});

			setTimeout(() => {
				window.requestAnimationFrame(async () => {
					const outline = this.state.outline;
					const blob = await pdf.export(outline!.data.filter(b => b.export));
					this.setState({exporting: false}, () => {
						this.setDownloadData(`${outline!.name || 'outline'}.pdf`, blob);
					});
				});
			}, 0);
		})
	}

	public handleExportText = () => {
		setTimeout(() => {
			window.requestAnimationFrame(() => {
				const outline = this.state.outline;
				const blocks = outline!.data.filter(b => b.export);
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
				this.setDownloadData(`${outline!.name || 'outline'}.txt`, str);
			});
		}, 0);
	}

	public handleExportOutline = () => {
		const outline = this.state.outline;
		this.setDownloadData(`${outline!.name || 'outline'}.cbo`, JSON.stringify(outline!.data));
	}

	public setDownloadData = (filename: string, data: string | Blob) => {
		const blob = typeof data === 'string' ? new Blob(['\ufeff', data]) : data;

		if (isMobile.iOS()) {
			this.setState({downloadData: {blob, filename}, showDrawer: false});
		} else {
			FileSaver.saveAs(blob, filename);
		}
	}

	public handleDownload = () => {
		const {blob, filename} = this.state.downloadData!;
		FileSaver.saveAs(blob, filename);
		this.setState({downloadData: null});
	}

	public handleToggleDrawer = (showDrawer: boolean) => () => {
		this.setState({showDrawer});
	}

	public handleToggleFileTree = (open: boolean) => (evt: any) => {
		if (evt && evt.type === 'keydown' && (evt.key === 'Tab' || evt.key === 'Shift')) {
			return;
		}

		this.setState({showFileTree: open});
	}

	public handleOpenNewDialog = () => {
		this.setState({showNewDialog: true});
	}

	public handleCloseNewDialog = () => {
		this.setState({showNewDialog: false, nameStr: ''});
	}

	public handleChangeNameStr = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({nameStr: evt.target.value});
	}

	public handleClearNameStr = () => {
		this.setState({nameStr: ''});
	}

	public handleClearDownloadData = () => {
		this.setState({downloadData: null});
	}

	public handleNew = async (name: any) => {
		const newOutline = {data: [], name: typeof name === 'string' ? name : this.state.nameStr};
		const {data} = await this.api.post('/outlines',	newOutline);

		const outline = data.outline;
		localStorage.setItem('outliner-data', JSON.stringify(outline));
		this.setState({outline, showNewDialog: false}, () => {
			this.handleList();
		});
	}

	public handleOpen = async (id: string) => {
		const {data} = await this.api.get(`/outlines/${id}`);

		const outline = data.outline;
		localStorage.setItem('outliner-data', JSON.stringify(outline));
		this.setState({outline, showOpenDialog: false, loading: false});
	}

	public handleList = async (firstLoad: boolean = false) => {
		const {data} = await this.api.get('/outlines');
		const outlines = data.outlines as ListOutline[];

		if (!firstLoad && outlines.length === 0) {
			return this.setState({availableOutlines: outlines, outline: undefined});
		}

		this.setState({availableOutlines: outlines}, () => {
			let outline: GetOutline | undefined;

			if (firstLoad) {
				const data = localStorage.getItem('outliner-data');
				if (data) {
					outline = JSON.parse(data);
				}
			} else {
				outline = this.state.outline;
			}

			if (outline && outlines.find(o => o.id === outline!.id)) {
				this.handleOpen(outline.id!);
			} else if (outlines.length > 0) {
				this.handleOpen(outlines[0].id);
			} else {
				this.setState({loading: false});
			}
		});
	}

	public handleSave = debounce(async () => {
		const outline = this.state.outline;
		const {data} = await this.api.patch(`/outlines/${outline!.id}`, pick(outline, ['name', 'data']));

		localStorage.setItem('outliner-data', JSON.stringify(data.outline));

		if (!outline!.id) {
			this.setState({outline: data.outline});
		}
	}, 500);

	public handleRename = async (name: string) => {
		await this.api.patch(`/outlines/${this.state.outline!.id}`, {name});

		this.setState({showRenameDialog: false}, () => {
			this.handleList();
		});
	}

	public handleDelete = async () => {
		if (!this.props.auth.isAuthenticated) {
			const outline = {data: []};
			return this.setState({outline, showConfirmDialog: false, showDrawer: false}, () => {
				localStorage.setItem('outliner-data', JSON.stringify(outline));
			});
		}

		const outline = this.state.outline;
		await this.api.delete(`/outlines/${outline!.id}`);

		this.setState({showConfirmDialog: false}, () => this.handleList());
	}

	public handleLogout = () => {
		localStorage.setItem('outliner-data', JSON.stringify({data: []}));
		this.props.auth.logout({returnTo: window.location.origin});
	}

	public handleFocusBlock = (ref: React.RefObject<any>) => {
		this.setState({appBarActions: ref.current ? ref.current.getActions() : []});
	}

	public render() {
		const {classes, fullScreen, auth} = this.props;
		const {
			outline,
			showDrawer,
			showFileTree,
			fontsLoaded,
			loading,
			exporting,
			availableOutlines,
			showNewDialog,
			nameStr,
			downloadData,
			appBarActions
		} = this.state;

		if (!fontsLoaded || loading || auth.loading) {
			return (
				<div className={classes.progressOverlay}>
					<CircularProgress disableShrink/>
				</div>
			);
		}

		return (
			<div className={classes.root}>
				{exporting && (
					<div className={classes.progressOverlay}>
						<CircularProgress disableShrink/>
					</div>
				)}
				<div className={classes.drawerContainer}>
					<MenuDrawer
						variant={auth.isAuthenticated ? 'temporary' : 'responsive'}
						fullScreen={fullScreen}
						open={showDrawer}
						onClose={this.handleToggleDrawer(false)}
						onNew={this.handleDelete}
						onImport={this.handleImportOutline}
						onExportOutline={this.handleExportOutline}
						onExportPDF={this.handleExportPDF}
						onExportText={this.handleExportText}
					/>
					{auth.isAuthenticated && (
						<FileTreeDrawer
							fullScreen={fullScreen}
							open={showFileTree}
							onOpenMenu={this.handleToggleDrawer(true)}
							onOpen={this.handleToggleFileTree(true)}
							onClose={this.handleToggleFileTree(false)}
							onNewOutline={this.handleNew}
							onRenameOutline={this.handleRename}
							onOpenOutline={this.handleOpen}
							onDeleteOutline={this.handleDelete}
							outlines={availableOutlines}
							outline={outline}
						/>
					)}
				</div>
				<div className={classes.container}>
					<div className={classes.appBar}>
						<IconButton onClick={this.handleToggleDrawer(true)} className={classes.menuButton}>
							<MenuIcon/>
						</IconButton>
						{auth.isAuthenticated && (
							<IconButton onClick={this.handleToggleFileTree(true)} className={classes.fileTreeButton}>
								<FileTreeIcon/>
							</IconButton>
						)}
						<div className={classes.blockActionContainer}>
							{appBarActions.map((a: any) => (
								a.icon ? (
									<IconButton key={a.label} onClick={a.fn} disabled={a.disabled} className={classes.blockAction}>
										<a.icon/>
									</IconButton>
								) : (
									<button key={a.label} onClick={a.fn} disabled={a.disabled} className={classes.blockAction}>
										{a.label}
									</button>
								)
							))}
						</div>
						{auth.isAuthenticated ? (
							<Button
								style={{marginLeft: 'auto', padding: '1.2rem', fontSize: '1.2rem', whiteSpace: 'nowrap'}}
								onClick={this.handleLogout}
							>
								Log out
							</Button>
						) : (
							<Button
								style={{marginLeft: 'auto', padding: '1.2rem', fontSize: '1.2rem', whiteSpace: 'nowrap'}}
								onClick={auth.loginWithRedirect}
							>
								Log in
							</Button>
						)}
						<IconButton
							style={{padding: '1.2rem'}}
							component="a"
							href="https://github.com/olavim/outliner"
							target="github"
						>
							<img src={githubIcon} style={{height: '2.4rem'}}/>
						</IconButton>
					</div>
					<div className={classes.content} ref={this.listContainerRef}>
						{outline ? (
							<BlockList
								fullScreen={fullScreen}
								blocks={outline.data}
								onChange={this.handleBlocksChange}
								onFocusBlock={this.handleFocusBlock}
							/>
						) : (
							<div className={classes.noDocumentContainer}>
								<Fab variant="extended" onClick={this.handleOpenNewDialog}>
									<FileIcon/>
									New Document
								</Fab>
							</div>
						)}
					</div>
				</div>
				<Dialog
					fullScreen={fullScreen}
					open={showNewDialog}
					onClose={this.handleCloseNewDialog}
					onExited={this.handleClearNameStr}
					fullWidth
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"New document"}</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							fullWidth
							value={nameStr}
							onChange={this.handleChangeNameStr}
							placeholder="untitled"
							InputProps={{style: {fontSize: '1.4rem', fontFamily: 'inherit'}}}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleCloseNewDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button
							onClick={this.handleNew}
							color="primary"
							className={classes.dialogButton}
							disabled={!nameStr}
						>
							Create
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					open={Boolean(downloadData)}
					onClose={this.handleClearDownloadData}
					classes={{paper: classes.downloadDialog}}
				>
					<Fab variant="extended" onClick={this.handleDownload} color="primary">
						<DownloadIcon/>
						Download File
					</Fab>
				</Dialog>
			</div>
		);
	}
}

export default withMobileDialog()(withAuth(withStyles(styles)(App)));
