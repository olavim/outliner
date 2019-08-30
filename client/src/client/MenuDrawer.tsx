import * as React from 'react';
import {createStyles, WithStyles, withStyles, Divider, ListItem, List, ListItemText, Drawer, Hidden, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from '@material-ui/core';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';

const styles = createStyles({
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
		color: 'rgba(0,0,0,0.54)'
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
	}
});

interface OwnProps {
	variant: 'responsive' | 'temporary';
	fullScreen?: boolean;
	open: boolean;
	onClose: () => void;
	onNew: () => void;
	onImport: (evt: React.ChangeEvent<HTMLInputElement>) => void;
	onExportOutline: () => void;
	onExportPDF: () => void;
	onExportText: () => void;
}

interface State {
	showConfirmDialog: boolean;
}

type Props = OwnProps & WithStyles<typeof styles> & WithAuthProps;

class MenuDrawer extends React.Component<Props> {
	public state: State = {
		showConfirmDialog: false
	};

	public handleOpenConfirmDialog = () => {
		this.setState({showConfirmDialog: true});
	}

	public handleCloseConfirmDialog = () => {
		this.setState({showConfirmDialog: false});
	}

	render() {
		const {
			classes,
			auth,
			variant,
			fullScreen,
			open,
			onClose,
			onNew,
			onImport,
			onExportOutline,
			onExportPDF,
			onExportText
		} = this.props;
		const {showConfirmDialog} = this.state;

		const drawer = (
			<div>
				<div className={classes.drawerHeader}>Colorbox</div>
				<Divider />
				{!auth.isAuthenticated && (
					<>
						<List>
							<ListItem button className={classes.drawerItem} onClick={this.handleOpenConfirmDialog}>
								<ListItemText primary="New" disableTypography />
							</ListItem>
						</List>
						<Divider />
					</>
				)}
				<List>
					<ListItem button className={classes.drawerItem}>
						<input
							className={classes.uploadInput}
							type="file"
							id="file"
							onChange={onImport}
							accept=".otl,.cbo"
						/>
						<label className={classes.uploadLabel} htmlFor="file">Import Outline</label>
					</ListItem>
				</List>
				<Divider />
				<List>
					<ListItem button className={classes.drawerItem} onClick={onExportOutline}>
						<ListItemText primary="Export Outline" disableTypography />
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={onExportPDF}>
						<ListItemText primary="Export PDF" disableTypography />
					</ListItem>
					<ListItem button className={classes.drawerItem} onClick={onExportText}>
						<ListItemText primary="Export Text" disableTypography />
					</ListItem>
				</List>
				<Dialog
					fullScreen={fullScreen}
					open={showConfirmDialog}
					onClose={this.handleCloseConfirmDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>
						Confirm new document
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
						<Button onClick={onNew} color="primary" className={classes.dialogButton} autoFocus>
							Create
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);

		if (variant === 'responsive') {
			return (
				<Drawer
					variant="temporary"
					anchor="left"
					open={open}
					onClose={onClose}
					classes={{paper: classes.drawerPaper}}
					ModalProps={{keepMounted: true}}
				>
					{drawer}
				</Drawer>
			);
		}

		return (
			<>
				<Hidden mdUp implementation="css">
					<Drawer
						variant="temporary"
						anchor="left"
						open={open}
						onClose={onClose}
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
		);
	}
};

export default withAuth(withStyles(styles)(MenuDrawer));
