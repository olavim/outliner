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
	TextField
} from '@material-ui/core';
import withAuth, {WithAuthProps} from '@/hocs/with-auth';
import NumberField from '@/NumberField';

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
		margin: '0.4rem',
		fontSize: '1.2rem',
		boxSizing: 'border-box'
	},
	textInput: {
		fontFamily: 'Montserrat',
		fontSize: '1.2rem',
		'& option': {
			fontSize: '1.2rem'
		}
	},
	textInputLabelShrink: {
		transform: 'translate(14px, -5px) scale(0.75) !important'
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
	onExportPDF: (width: number, height: number, margin: number) => void;
	onExportText: () => void;
}

interface State {
	showConfirmDialog: boolean;
	showPDFDialog: boolean;
	pageSize: keyof typeof PAGE_DIMENSIONS | 'custom';
	pageDimensions: PageDimension;
	margin: number;
	unit: keyof typeof UNIT;
}

type Props = OwnProps & WithStyles<typeof styles> & WithAuthProps;

const usLang = window.navigator.language === 'en-US';

class MenuDrawer extends React.Component<Props> {
	public state: State = {
		showConfirmDialog: false,
		showPDFDialog: false,
		pageSize: usLang ? 'letter' : 'a4',
		pageDimensions: usLang ? PAGE_DIMENSIONS.letter : PAGE_DIMENSIONS.a4,
		margin: usLang ? 0.5 : 12.7,
		unit: usLang ? 'inch' : 'mm'
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
		const {pageDimensions, margin, unit} = this.state;
		const unitRate = UNIT_RATE[pageDimensions.unit]['inch'];
		const inWidth = pageDimensions.width * unitRate;
		const inHeight = pageDimensions.height * unitRate;
		const inMargin = margin * UNIT_RATE[unit]['inch'];
		this.props.onExportPDF(inWidth, inHeight, inMargin);
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
				margin: parseFloat((state.margin * UNIT_RATE[state.unit][unit]).toFixed(2)),
				unit
			}
		});
	}

	public handleChangeMargin = (evt: React.ChangeEvent<HTMLSelectElement>) => {
		const value = evt.target.value as keyof typeof UNIT;
		const margin = parseFloat(value);
		this.setState({margin});
	}

	public handleDimensionChange = (dimension: 'width' | 'height') => (evt: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = evt.target.value;

		if (!rawValue.match(/^\d+\.?\d*$/)) {
			return;
		}

		this.setState((state: State) => {
			const pageDimensions = {...state.pageDimensions};

			if (state.unit !== state.pageDimensions.unit) {
				const unitRate = UNIT_RATE[state.pageDimensions.unit][state.unit];
				pageDimensions.width = parseFloat((pageDimensions.width * unitRate).toFixed(2));
				pageDimensions.height = parseFloat((pageDimensions.height * unitRate).toFixed(2));
				pageDimensions.unit = state.unit as UNIT;
			}

			pageDimensions[dimension] = parseFloat(rawValue);

			return {
				pageSize: 'custom',
				pageDimensions
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
		const {showConfirmDialog, showPDFDialog, pageSize, pageDimensions, margin, unit} = this.state;

		const dim: any = {
			width: pageDimensions.width * UNIT_RATE[pageDimensions.unit][unit],
			height: pageDimensions.height * UNIT_RATE[pageDimensions.unit][unit]
		};

		if (unit !== pageDimensions.unit) {
			dim.width = parseFloat(dim.width.toFixed(2));
			dim.height = parseFloat(dim.height.toFixed(2));
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
						Export PDF
					</DialogTitle>
					<DialogContent>
						<div style={{display: 'flex', marginBottom: '0.4rem'}}>
							<TextField
								className={`${classes.textInput} ${classes.formControl}`}
								value={pageSize}
								onChange={this.handleChangePageSize}
								label="Page size"
								fullWidth
								variant="outlined"
								select
								SelectProps={{
									native: true,
									className: classes.textInput
								}}
								InputLabelProps={{
									className: classes.textInput,
									classes: {shrink: classes.textInputLabelShrink}
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
						<div style={{display: 'flex', marginBottom: '0.4rem'}}>
							<TextField
								className={classes.formControl}
								value={unit}
								onChange={this.handleChangeUnit}
								label="Unit"
								fullWidth
								variant="outlined"
								select
								SelectProps={{
									native: true,
									className: classes.textInput
								}}
								InputLabelProps={{
									className: classes.textInput,
									classes: {shrink: classes.textInputLabelShrink}
								}}
							>
								<option value="inch">Inches</option>
								<option value="mm">Millimeters</option>
							</TextField>
						</div>
						<div style={{display: 'flex', marginBottom: '0.4rem'}}>
							<NumberField
								className={classes.formControl}
								variant="outlined"
								value={dim.width}
								onChange={this.handleDimensionChange('width')}
								label="Width"
								fullWidth
								InputProps={{className: classes.textInput}}
								InputLabelProps={{
									className: classes.textInput,
									classes: {shrink: classes.textInputLabelShrink}
								}}
							/>
							<NumberField
								className={classes.formControl}
								variant="outlined"
								value={dim.height}
								onChange={this.handleDimensionChange('height')}
								label="Height"
								fullWidth
								InputProps={{className: classes.textInput}}
								InputLabelProps={{
									className: classes.textInput,
									classes: {shrink: classes.textInputLabelShrink}
								}}
							/>
						</div>
						<div style={{display: 'flex'}}>
							<NumberField
								className={classes.formControl}
								variant="outlined"
								value={margin}
								onChange={this.handleChangeMargin}
								label="Margin"
								fullWidth
								InputProps={{className: classes.textInput}}
								InputLabelProps={{
									className: classes.textInput,
									classes: {shrink: classes.textInputLabelShrink}
								}}
							/>
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
