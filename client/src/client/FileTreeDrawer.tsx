import * as React from 'react';
import {
	createStyles,
	WithStyles,
	withStyles,
	Divider,
	ListItem,
	List,
	ListItemText,
	Drawer,
	Hidden,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	ListItemIcon,
	SwipeableDrawer,
	TextField,
	DialogContentText
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';
import {ListOutline, GetOutline} from '@/App';

const styles = createStyles({
	drawerPaper: {
		width: '22%',
		maxWidth: '24rem',
		minWidth: '15rem',
		'@media (max-width: 960px)': {
			width: '24rem'
		}
	},
	dialogTitle: {
		fontSize: '1.6rem',
		fontWeight: 600,
		color: 'rgba(0,0,0,0.87)'
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
	fileTreeContainer: {
		flex: '1 1 auto',
		display: 'flex',
		flexDirection: 'column',
		'& hr': {
			backgroundColor: 'rgba(0,0,0,0.81)'
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
		color: 'rgba(255,255,255,0.63)',
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
		flex: '1 1 auto',
		backgroundColor: '#475a6f',
		color: '#ffffff',
		paddingTop: 0,
		'& svg': {
			opacity: 0.6,
			fontSize: '16px'
		},
		'@media (min-width: 960px)': {
			boxShadow: 'inset -0.4rem 0.4rem 4rem 0 rgba(0,0,0,0.15)'
		}
	},
	fileTreeItem: {
		paddingTop: 0,
		paddingBottom: 0,
		height: '3.6rem',
		fontSize: '1.3rem',
		fontWeight: 400,
		'&$active, &$active:focus, &$active:hover': {
			backgroundColor: 'rgba(29, 155, 193, 0.38)',
			cursor: 'default'
		}
	},
	active: {}
});

interface OwnProps {
	fullScreen?: boolean;
	open: boolean;
	onOpenMenu: () => void;
	onOpen: (evt: any) => void;
	onClose: (evt: any) => void;
	onNewOutline: (name: string) => void;
	onRenameOutline: (name: string) => void;
	onDeleteOutline: () => void;
	onOpenOutline: (id: string) => void;
	outlines: ListOutline[];
	outline?: GetOutline;
}

interface State {
	showConfirmDialog: boolean;
	showRenameDialog: boolean;
	showNewDialog: boolean;
	nameStr: string;
}

type Props = OwnProps & WithStyles<typeof styles> & WithAuthProps;

class FileTreeDrawer extends React.Component<Props> {
	public state: State = {
		showConfirmDialog: false,
		showRenameDialog: false,
		showNewDialog: false,
		nameStr: ''
	};

	public handleOpenConfirmDialog = () => {
		this.setState({showConfirmDialog: true});
	}

	public handleCloseConfirmDialog = () => {
		this.setState({showConfirmDialog: false});
	}

	public handleOpenRenameDialog = () => {
		this.setState({showRenameDialog: true, nameStr: this.props.outline!.name || ''});
	}

	public handleCloseRenameDialog = () => {
		this.setState({showRenameDialog: false});
	}

	public handleOpenNewDialog = () => {
		this.setState({showNewDialog: true});
	}

	public handleCloseNewDialog = () => {
		this.setState({showNewDialog: false});
	}

	public handleChangeNameStr = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({nameStr: evt.target.value});
	}

	public handleClearNameStr = () => {
		this.setState({nameStr: ''});
	}

	public handleRenameOutline = () => {
		this.props.onRenameOutline(this.state.nameStr);
		this.handleCloseRenameDialog();
	};

	public handleNewOutline = () => {
		this.props.onNewOutline(this.state.nameStr);
		this.handleCloseNewDialog();
	};

	public handleDeleteOutline = () => {
		this.setState({showConfirmDialog: false}, () => {
			this.props.onDeleteOutline();
		});
	};

	render() {
		const {
			classes,
			fullScreen,
			onOpenMenu,
			open,
			onOpen,
			onClose,
			onOpenOutline,
			outlines,
			outline
		} = this.props;
		const {showConfirmDialog, showNewDialog, showRenameDialog, nameStr} = this.state;

		const fileTree = (
			<div className={classes.fileTreeContainer}>
				<Hidden smDown implementation="css">
					<div className={classes.fileTreeHeader}>
						<IconButton style={{color: 'inherit'}} onClick={onOpenMenu}>
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
					{outlines.map(o => (
						<ListItem
							button
							className={classes.fileTreeItem}
							classes={{selected: classes.active}}
							onClick={() => onOpenOutline(o.id)}
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
			<>
				<Hidden mdUp implementation="css">
					<SwipeableDrawer
						anchor="left"
						open={open}
						onOpen={onOpen}
						onClose={onClose}
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
							onClick={this.handleNewOutline}
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
					open={showRenameDialog}
					onClose={this.handleCloseRenameDialog}
					onExited={this.handleClearNameStr}
					fullWidth
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>{"Rename document"}</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							fullWidth
							value={nameStr}
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
							onClick={this.handleRenameOutline}
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
					open={showConfirmDialog}
					onClose={this.handleCloseConfirmDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>
						Confirm delete
					</DialogTitle>
					<DialogContent>
						<DialogContentText className={classes.dialogText}>
							Your current document will be lost. Please save your work before creating a new document if you wish to restore it later.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleCloseConfirmDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button onClick={this.handleDeleteOutline} color="primary" className={classes.dialogButton} autoFocus>
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	}
};

export default withAuth(withStyles(styles)(FileTreeDrawer));
