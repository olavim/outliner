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
	DialogContentText,
	DialogActions,
	Button,
	FormControl,
	OutlinedInput,
	TextField
} from '@material-ui/core';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';

enum UNIT {
	inch = 'inch',
	mm = 'mm'
}

interface PageDimension {
	width: number;
	height: number;
	unit: UNIT;
};

const PAGE_DIMENSIONS_US: {[x: string]: PageDimension} = {
	letter: {
		width: 8.5,
		height: 11,
		unit: UNIT.inch
	},
	tabloid: {
		width: 11,
		height: 17,
		unit: UNIT.inch
	}
};

const PAGE_DIMENSIONS_ISO: {[x: string]: PageDimension} = {
	a3: {
		width: 297,
		height: 420,
		unit: UNIT.mm
	},
	a4: {
		width: 210,
		height: 297,
		unit: UNIT.mm
	},
	a5: {
		width: 148,
		height: 210,
		unit: UNIT.mm
	},
	a6: {
		width: 105,
		height: 148,
		unit: UNIT.mm
	}
};

const PAGE_DIMENSIONS: {[x: string]: PageDimension} = {
	...PAGE_DIMENSIONS_US,
	...PAGE_DIMENSIONS_ISO,
};

const UNIT_RATE: {[x in keyof typeof UNIT]: {[z in keyof typeof UNIT]: number}} = {
	[UNIT.inch]: {
		[UNIT.inch]: 1,
		[UNIT.mm]: 25.4
	},
	[UNIT.mm]: {
		[UNIT.inch]: 1 / 25.4,
		[UNIT.mm]: 1
	}
}

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
	},
	formControl: {
		padding: '0.4rem',
		fontSize: '1.2rem',
		boxSizing: 'border-box'
	},
	textInput: {
		fontFamily: 'Montserrat',
		fontSize: '1.2rem',
		'& option': {
			fontSize: '1.2rem'
		}
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
	onExportPDF: (width: number, height: number) => void;
	onExportText: () => void;
}

interface State {
	showConfirmDialog: boolean;
	showPDFDialog: boolean;
	pageSize: keyof typeof PAGE_DIMENSIONS | 'custom';
	pageDimensions: {
		width: number,
		height: number,
		unit: keyof typeof UNIT
	};
	unit: keyof typeof UNIT;
	pad: {
		width: number;
		height: number;
	};
	trailingDot: {
		width: boolean;
		height: boolean;
	}
}

type Props = OwnProps & WithStyles<typeof styles> & WithAuthProps;

class MenuDrawer extends React.Component<Props> {
	public state: State = {
		showConfirmDialog: false,
		showPDFDialog: false,
		pageSize: 'letter',
		pageDimensions: PAGE_DIMENSIONS.letter,
		unit: 'inch',
		pad: {
			width: 0,
			height: 0
		},
		trailingDot: {
			width: false,
			height: false
		}
	};

	public handleOpenConfirmDialog = () => {
		this.setState({showConfirmDialog: true});
	}

	public handleCloseConfirmDialog = () => {
		this.setState({showConfirmDialog: false});
	}

	public handleOpenPDFDialog = () => {
		this.setState({showPDFDialog: true});
	}

	public handleClosePDFDialog = () => {
		this.setState({showPDFDialog: false});
	}

	public handleExportPDF = () => {
		const {pageDimensions} = this.state;
		const unitRate = UNIT_RATE[pageDimensions.unit]['inch'];
		const pxWidth = pageDimensions.width * unitRate;
		const pxHeight = pageDimensions.height * unitRate;
		this.props.onExportPDF(pxWidth, pxHeight);
	}

	public handleChangePageSize = (evt: React.ChangeEvent<HTMLSelectElement>) => {
		const pageSize = evt.target.value as keyof typeof PAGE_DIMENSIONS | 'custom';
		this.setState((state: State) => {
			const unitRate = UNIT_RATE[state.pageDimensions.unit][state.unit];

			const pageDimensions = pageSize === 'custom'
				? {
					width: parseFloat((state.pageDimensions.width * unitRate).toFixed(2)),
					height: parseFloat((state.pageDimensions.height * unitRate).toFixed(2)),
					unit: state.unit
				}
				: PAGE_DIMENSIONS[pageSize];
			return {pageSize, pageDimensions};
		});
	}

	public handleChangeUnit = (evt: React.ChangeEvent<HTMLSelectElement>) => {
		const unit = evt.target.value as keyof typeof UNIT;

		this.setState((state: State) => {
			const pageDimensions = state.pageSize === 'custom'
				? {
					width: state.pageDimensions.width,
					height: state.pageDimensions.height,
					unit: state.pageDimensions.unit
				}
				: PAGE_DIMENSIONS[state.pageSize];

			return {
				pageDimensions,
				unit
			}
		});
	}

	public handleDimensionChange = (dimension: 'width' | 'height') => (evt: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = evt.target.value;

		if (!rawValue.match(/^\d+\.?\d*$/)) {
			return;
		}

		this.setState((state: State) => {
			const trailingDot = {...state.trailingDot};
			const pad = {...state.pad};
			const pageDimensions = {...state.pageDimensions};

			let requiredPadding = 0;
			let hasTrailingDot = false;

			if (rawValue.indexOf('.') !== -1) {
				if (rawValue.endsWith('.')) {
					hasTrailingDot = true;
				} else {
					const decimals = rawValue.slice(rawValue.indexOf('.'));
					const match = decimals.match(/^$|0+$/);
					requiredPadding = match ? Math.max(1, match[0].length) : 0;
				}
			}

			pad[dimension] = requiredPadding;
			pageDimensions[dimension] = parseFloat(rawValue);
			trailingDot[dimension] = hasTrailingDot;

			if (state.unit !== state.pageDimensions.unit) {
				const unitRate = UNIT_RATE[state.pageDimensions.unit][state.unit];
				pageDimensions.width = parseFloat((pageDimensions.width * unitRate).toFixed(2));
				pageDimensions.height = parseFloat((pageDimensions.height * unitRate).toFixed(2));
			}

			return {
				pageSize: 'custom',
				pageDimensions,
				pad,
				trailingDot
			};
		});
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
			onExportText
		} = this.props;
		const {showConfirmDialog, showPDFDialog, pageSize, pageDimensions, unit, pad, trailingDot} = this.state;

		const dim: any = {
			width: pageDimensions.width * UNIT_RATE[pageDimensions.unit][unit],
			height: pageDimensions.height * UNIT_RATE[pageDimensions.unit][unit]
		};

		if (unit !== pageDimensions.unit) {
			dim.width = dim.width.toFixed(2);
			dim.height = dim.height.toFixed(2);
		} else {
			const wStr = String(dim.width);
			const hStr = String(dim.height);
			const wDecimals = dim.width % 1 === 0 ? 0 : wStr.slice(wStr.indexOf('.')).length - 1;
			const hDecimals = dim.height % 1 === 0 ? 0 : hStr.slice(hStr.indexOf('.')).length - 1;

			dim.width = dim.width.toFixed(wDecimals + pad.width);
			dim.height = dim.height.toFixed(hDecimals + pad.height);

			dim.width += trailingDot.width ? '.' : '';
			dim.height += trailingDot.height ? '.' : '';
		}

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
					<ListItem button className={classes.drawerItem} onClick={this.handleOpenPDFDialog}>
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
				<Dialog
					fullScreen={fullScreen}
					open={showPDFDialog}
					onClose={this.handleClosePDFDialog}
				>
					<DialogTitle disableTypography className={classes.dialogTitle}>
						Page size
					</DialogTitle>
					<DialogContent>
						<div>
							<TextField
								className={`${classes.textInput} ${classes.formControl}`}
								value={pageSize}
								onChange={this.handleChangePageSize}
								fullWidth
								variant="outlined"
								select
								SelectProps={{
									native: true,
									className: classes.textInput
								}}
							>
								<optgroup>
									{Object.keys(PAGE_DIMENSIONS_US).map(key => (
										<option key={key} value={key}>
											{key.slice(0, 1).toUpperCase()}{key.slice(1)}
										</option>
									))}
								</optgroup>
								<optgroup>
									{Object.keys(PAGE_DIMENSIONS_ISO).map(key => (
										<option key={key} value={key}>
											{key.slice(0, 1).toUpperCase()}{key.slice(1)}
										</option>
									))}
								</optgroup>
								<optgroup>
									<option value="custom">Custom</option>
								</optgroup>
								<optgroup />
							</TextField>
						</div>
						<div>
							<FormControl variant="outlined" className={classes.formControl}>
								<OutlinedInput
									className={classes.textInput}
									value={dim.width}
									onChange={this.handleDimensionChange('width')}
									placeholder="Width"
									labelWidth={0}
								/>
							</FormControl>
							<FormControl variant="outlined" className={classes.formControl}>
								<OutlinedInput
									className={classes.textInput}
									value={dim.height}
									onChange={this.handleDimensionChange('height')}
									placeholder="Height"
									labelWidth={0}
								/>
							</FormControl>
							<TextField
								className={`${classes.textInput} ${classes.formControl}`}
								value={unit}
								onChange={this.handleChangeUnit}
								variant="outlined"
								select
								SelectProps={{
									native: true,
									className: classes.textInput
								}}
							>
								<option value="inch">inch</option>
								<option value="mm">mm</option>
							</TextField>
						</div>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClosePDFDialog} color="primary" className={classes.dialogButton}>
							Cancel
						</Button>
						<Button onClick={this.handleExportPDF} color="primary" className={classes.dialogButton} autoFocus>
							Export
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);

		if (variant === 'temporary') {
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
