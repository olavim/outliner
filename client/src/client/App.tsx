import * as React from 'react';
import {findDOMNode} from 'react-dom';
import axios from 'axios';
import {cloneDeep, pick, debounce} from 'lodash';
import {
	createStyles,
	WithStyles,
	withStyles,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Divider,
	IconButton,
	Hidden,
	Drawer,
	SwipeableDrawer,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	ListItemIcon,
	Fab,
	DialogContentText
} from '@material-ui/core';
import withMobileDialog, {InjectedProps as WithMobileDialog} from '@material-ui/core/withMobileDialog';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import WebFont from 'webfontloader';
import MenuIcon from '@material-ui/icons/Menu';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import githubIcon from './github-32px.png';
import BlockList, {BlockData} from './BlockList';
import PDF from '@/lib/create-pdf';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';

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
		flex: 1,
		width: '100%'
	},
	appBar: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 5rem',
		padding: '0 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		boxShadow: '0 0 0.6rem 0 #00000066',
		zIndex: 100,
		'& .outline': {
			marginRight: '1rem',
			minHeight: '2.6rem'
		}
	},
	menuButton: {
		padding: '0.6rem',
		'@media (min-width: 960px)': {
			display: 'none'
		}
	},
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
		overflowY: 'scroll',
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
		paddingLeft: '16px',
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
		paddingLeft: '1.6rem',
		fontWeight: 600,
		fontSize: '2rem',
		height: '5rem',
		color: '#0000008a'
	},
	drawerItem: {
		paddingTop: 0,
		paddingBottom: 0,
		height: '3.6rem',
		fontSize: '1.3rem',
		fontWeight: 400
	},
	fileTreeHandleContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '0.7rem',
		height: '100%',
		backgroundColor: '#475a6f',
		display: 'flex',
		alignItems: 'center'
	},
	fileTreeHandle: {
		width: '0.7rem',
		height: '5rem',
		backgroundColor: '#778a9f',
		cursor: 'pointer',
		zIndex: 1200,
		'&:hover': {
			backgroundColor: '#6296d0'
		}
	},
	fileTreeContainer: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		'& hr': {
			backgroundColor: '#000000cf'
		},
		'@media (max-width: 960px)': {
			borderRight: '0.2rem solid #2c3744'
		}
	},
	fileTreeHeader: {
		backgroundColor: '#303942',
		display: 'flex',
		alignItems: 'center',
		paddingLeft: '1rem',
		fontWeight: 600,
		fontSize: '2rem',
		height: '5rem',
		color: '#ffffffa1',
		'& button': {
			padding: '0.6rem'
		}
	},
	fileTreeActions: {
		display: 'flex',
		flexDirection: 'row',
		backgroundColor: '#374656',
		padding: '0 1rem',
		'& button': {
			padding: '0.6rem',
			margin: '0.6rem 0',
			'&:first-child': {
				marginRight: 'auto'
			}
		},
		'& svg': {
			color: '#fff',
			fontSize: '20px'
		},
		'@media (max-width: 960px)': {
			height: '5rem'
		}
	},
	fileTreeList: {
		flex: 1,
		backgroundColor: '#475a6f',
		color: '#ffffff',
		'& svg': {
			opacity: 0.6,
			fontSize: '16px'
		},
		'@media (min-width: 960px)': {
			boxShadow: 'inset -0.4rem 0.4rem 4rem 0 #00000026'
		}
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
	},
	outlineTable: {
		'& *': {
			fontSize: '1.2rem'
		}
	},
	outlineTableRow: {
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: '#def3ff'
		}
	},
	active: {},
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
	}
});

interface ListOutline {
	id: string;
	name: string;
	createdAt: string;
	updatedAt?: string;
}

interface GetOutline {
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
	exporting: boolean;
	showDrawer: boolean;
	showFileTree: boolean;
	showOpenDialog: boolean;
	showRenameDialog: boolean;
	showNewDialog: boolean;
	showConfirmDialog: boolean;
}

const trimNewLines = (str: string) => {
	return str.replace(/(\n|\r)+$/, '').replace(/^(\n|\r)+/, '');
}

class App extends React.Component<WithMobileDialog & WithStyles<typeof styles> & WithAuthProps, State> {
	public listRef = React.createRef<any>();

	public state: State = {
		fontsLoaded: false,
		availableOutlines: [],
		nameStr: '',
		exporting: false,
		showDrawer: false,
		showFileTree: false,
		showOpenDialog: false,
		showRenameDialog: false,
		showNewDialog: false,
		showConfirmDialog: false
	};

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
			if (data) {
				this.setState({outline: JSON.parse(data)});
			} else {
				this.setState({outline: {data: []}});
			}
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

	public handleImportOutline = () => {
		const fileElem = document.getElementById('file') as HTMLInputElement | null;
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
					const token = await this.props.auth.getTokenSilently();
					const {data} = await axios.post(
						`${window.env.API_URL}/outlines`,
						newOutline,
						{headers: {Authorization: `Bearer ${token}`}}
					);

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
					const outline = this.state.outline;
					pdf.export(outline!.data.filter(b => b.export), outline!.name)
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
				this.downloadData(`${outline!.name || 'outline'}.txt`, str);
			});
		}, 0);
	}

	public handleExportOutline = () => {
		const outline = this.state.outline;
		this.downloadData(`${outline!.name || 'outline'}.cbo`, JSON.stringify(outline!.data));
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

	public handleToggleFileTree = (open: boolean) => (evt: any) => {
		if (evt && evt.type === 'keydown' && (evt.key === 'Tab' || evt.key === 'Shift')) {
			return;
		}

		this.setState({showFileTree: open});
	}

	public handleCloseOpenDialog = () => {
		this.setState({showOpenDialog: false});
	}

	public handleOpenRenameDialog = () => {
		this.setState({showRenameDialog: true, nameStr: this.state.outline!.name || ''});
	}

	public handleCloseRenameDialog = () => {
		this.setState({showRenameDialog: false, nameStr: ''});
	}

	public handleOpenNewDialog = () => {
		this.setState({showNewDialog: true});
	}

	public handleCloseNewDialog = () => {
		this.setState({showNewDialog: false, nameStr: ''});
	}

	public handleOpenConfirmDialog = () => {
		this.setState({showConfirmDialog: true});
	}

	public handleCloseConfirmDialog = () => {
		this.setState({showConfirmDialog: false});
	}

	public handleChangeNameStr = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({nameStr: evt.target.value});
	}

	public handleClearNameStr = () => {
		this.setState({nameStr: ''});
	}

	public handleNew = async () => {
		const newOutline = {data: [], name: this.state.nameStr};
		const token = await this.props.auth.getTokenSilently();
		const {data} = await axios.post(
			`${window.env.API_URL}/outlines`,
			newOutline,
			{headers: {Authorization: `Bearer ${token}`}}
		);

		const outline = data.outline;
		localStorage.setItem('outliner-data', JSON.stringify(outline));
		this.setState({outline, showNewDialog: false}, () => {
			this.handleList();
		});
	}

	public handleOpen = async (id: string) => {
		const token = await this.props.auth.getTokenSilently();
		const {data} = await axios.get(`${window.env.API_URL}/outlines/${id}`, {
			headers: {Authorization: `Bearer ${token}`}
		});

		const outline = data.outline;
		localStorage.setItem('outliner-data', JSON.stringify(outline));
		this.setState({outline, showOpenDialog: false});
	}

	public handleList = async (firstLoad: boolean = false) => {
		const token = await this.props.auth.getTokenSilently();
		const {data} = await axios.get(`${window.env.API_URL}/outlines`, {
			headers: {Authorization: `Bearer ${token}`}
		});
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
			}
		});
	}

	public handleSave = debounce(async () => {
		const token = await this.props.auth.getTokenSilently();
		const outline = this.state.outline;

		const {data} = await axios.patch(
			`${window.env.API_URL}/outlines/${outline!.id}`,
			pick(outline, ['name', 'data']),
			{headers: {Authorization: `Bearer ${token}`}}
		);

		localStorage.setItem('outliner-data', JSON.stringify(data.outline));

		if (!outline!.id) {
			this.setState({outline: data.outline});
		}
	}, 500);

	public handleRename = async () => {
		const token = await this.props.auth.getTokenSilently();

		await axios.patch(
			`${window.env.API_URL}/outlines/${this.state.outline!.id}`,
			{name: this.state.nameStr},
			{headers: {Authorization: `Bearer ${token}`}}
		);

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

		const token = await this.props.auth.getTokenSilently();
		const outline = this.state.outline;

		await axios.delete(`${window.env.API_URL}/outlines/${outline!.id}`, {
			headers: {Authorization: `Bearer ${token}`}
		});

		this.setState({showConfirmDialog: false}, () => this.handleList());
	}

	public handleLogout = () => {
		localStorage.setItem('outliner-data', JSON.stringify({data: []}));
		this.props.auth.logout();
	}

	public render() {
		const {classes, fullScreen, auth} = this.props;

		if (auth.loading) {
			return <div>Loading</div>
		}

		if (!this.state.fontsLoaded) {
			return (
				<div className={classes.progressOverlay}>
					<CircularProgress disableShrink/>
				</div>
			);
		}

		const outline = this.state.outline;

		const drawer = (
			<div>
				<div className={classes.drawerHeader}>Colorbox</div>
				<Divider/>
				{!auth.isAuthenticated && (
					<>
						<List>
							<ListItem button className={classes.drawerItem} onClick={this.handleOpenConfirmDialog}>
								<ListItemText primary="New" disableTypography/>
							</ListItem>
						</List>
						<Divider/>
					</>
				)}
				<List>
					<ListItem button className={classes.drawerItem}>
						<input
							className={classes.uploadInput}
							type="file"
							id="file"
							onChange={this.handleImportOutline}
							accept=".otl,.cbo"
						/>
						<label className={classes.uploadLabel} htmlFor="file">Import Outline</label>
					</ListItem>
				</List>
				<Divider/>
				<List>
					<ListItem button className={classes.drawerItem} onClick={this.handleExportOutline}>
						<ListItemText primary="Export Outline" disableTypography/>
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={this.handleExportPDF}>
						<ListItemText primary="Export PDF" disableTypography/>
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={this.handleExportText}>
						<ListItemText primary="Export Text" disableTypography/>
					</ListItem>
				</List>
			</div>
		);

		const fileTree = (
			<div className={classes.fileTreeContainer}>
				<Hidden smDown implementation="css">
					<div className={classes.fileTreeHeader}>
							<IconButton style={{color: 'inherit'}} onClick={this.handleToggleDrawer}>
								<MenuIcon/>
							</IconButton>
					</div>
					<Divider/>
				</Hidden>
				<div className={classes.fileTreeActions}>
					<IconButton onClick={this.handleOpenNewDialog} title="New Document">
						<FileIcon/>
					</IconButton>
					<IconButton onClick={this.handleOpenRenameDialog} title="Rename">
						<EditIcon/>
					</IconButton>
					<IconButton onClick={this.handleOpenConfirmDialog} title="Delete">
						<DeleteIcon/>
					</IconButton>
				</div>
				<Hidden mdUp implementation="css">
					<Divider/>
				</Hidden>
				<List className={classes.fileTreeList}>
					{this.state.availableOutlines.map(o => (
						<ListItem
							button
							className={classes.drawerItem}
							onClick={() => this.handleOpen(o.id)}
							selected={outline && o.id === outline.id}
							key={o.id}
							title={o.name}
						>
							<ListItemIcon style={{marginRight: 0, color: 'inherit'}}><FileIcon/></ListItemIcon>
							<ListItemText
								primary={o.name}
								disableTypography
								style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
							/>
						</ListItem>
					))}
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
					{auth.isAuthenticated ? (
						<>
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
							<Hidden mdUp implementation="css">
								<div className={classes.fileTreeHandleContainer}>
									<div className={classes.fileTreeHandle} onClick={this.handleToggleFileTree(true)}/>
								</div>
								<SwipeableDrawer
									anchor="left"
									open={this.state.showFileTree}
									onOpen={this.handleToggleFileTree(true)}
									onClose={this.handleToggleFileTree(false)}
									classes={{paper: classes.drawerPaper}}
									ModalProps={{keepMounted: true}}
								>
									{fileTree}
								</SwipeableDrawer>
							</Hidden>
							<Hidden smDown implementation="css">
								<Drawer
									classes={{paper: classes.drawerPaper}}
									variant="permanent"
									open
								>
									{fileTree}
								</Drawer>
							</Hidden>
						</>
					) : (
						<>
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
						</>
					)}
				</div>
				<div className={classes.container}>
					<div className={classes.appBar}>
						<IconButton onClick={this.handleToggleDrawer} className={classes.menuButton}>
							<MenuIcon/>
						</IconButton>
						{auth.isAuthenticated ? (
							<Button
								style={{marginLeft: 'auto', padding: '1.2rem', fontSize: '1.2rem'}}
								onClick={this.handleLogout}
							>
								Log out
							</Button>
						) : (
							<Button
								style={{marginLeft: 'auto', padding: '1.2rem', fontSize: '1.2rem'}}
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
					<div className={classes.content} ref={this.listRef}>
						{outline ? (
							<BlockList
								blocks={outline.data}
								onChange={this.handleBlocksChange}
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
					open={this.state.showOpenDialog}
					onClose={this.handleCloseOpenDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"Open document"}</DialogTitle>
					<Table className={classes.outlineTable}>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Created</TableCell>
								<TableCell>Last Updated</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.availableOutlines.map(o => (
								<TableRow className={classes.outlineTableRow} onClick={() => this.handleOpen(o.id)} key={o.id}>
									<TableCell>{o.name}</TableCell>
									<TableCell>{new Date(o.createdAt).toLocaleString(navigator.language)}</TableCell>
									<TableCell>{o.updatedAt ? new Date(o.updatedAt).toLocaleString(navigator.language) : '-'}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<DialogActions>
						<Button onClick={this.handleCloseOpenDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					fullScreen={fullScreen}
					open={this.state.showRenameDialog}
					onClose={this.handleCloseRenameDialog}
					onExited={this.handleClearNameStr}
					fullWidth
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"Rename document"}</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							fullWidth
							value={this.state.nameStr}
							onChange={this.handleChangeNameStr}
							placeholder="untitled"
							InputProps={{style: {fontSize: '1.3rem', fontFamily: 'inherit'}}}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleCloseRenameDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button
							onClick={this.handleRename}
							color="primary"
							className={classes.dialogButton}
							disabled={!this.state.nameStr}
						>
							Rename
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					fullScreen={fullScreen}
					open={this.state.showNewDialog}
					onClose={this.handleCloseNewDialog}
					onExited={this.handleClearNameStr}
					fullWidth
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"New document"}</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							fullWidth
							value={this.state.nameStr}
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
							disabled={!this.state.nameStr}
						>
							Create
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					fullScreen={fullScreen}
					open={this.state.showConfirmDialog}
					onClose={this.handleCloseConfirmDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>
						{auth.isAuthenticated ? 'Confirm delete' : 'Confirm new document'}
					</DialogTitle>
					<DialogContent>
						<DialogContentText className={classes.dialogText}>
							{auth.isAuthenticated
								? 'Are you sure you want to delete the current document? This action cannot be reversed.'
								: 'Your current document will be lost. Please save your work before creating a new document if you wish to restore it later.'
							}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleCloseConfirmDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button onClick={this.handleDelete} color="primary" className={classes.dialogButton} autoFocus>
							{auth.isAuthenticated ? 'Delete' : 'Create'}
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}

export default withMobileDialog()(withAuth(withStyles(styles)(App)));
