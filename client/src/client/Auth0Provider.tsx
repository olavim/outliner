import React from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

const DEFAULT_REDIRECT_CALLBACK = (_appState?: any) =>
	window.history.replaceState({}, document.title, window.location.pathname);

export interface Auth0ContextProps {
	isAuthenticated: boolean;
	user: any | null;
	loading: boolean;
	popupOpen: boolean;
	loginWithPopup: (params?: PopupLoginOptions) => any;
	handleRedirectCallback: () => any;
	getIdTokenClaims: (...args: any[]) => Promise<IdToken>;
	loginWithRedirect: (...args: any[]) => void;
	getTokenSilently: (...args: any[]) => any;
	getTokenWithPopup: (...args: any[]) => Promise<string>;
	logout: (...args: any[]) => void;
}

export const Auth0Context = React.createContext<Auth0ContextProps>({} as any);

interface Auth0ProviderProps {
	onRedirectCallback: (appState?: any) => any;
	domain: string;
	clientId: string;
	redirectUri?: string;
	leeway?: number;
	audience?: string;
	scope?: string;
}

interface Auth0ProviderState {
	auth0Client: Auth0Client | null;
	isAuthenticated: boolean;
	user: any;
	loading: boolean;
	popupOpen: boolean;
}

export class Auth0Provider extends React.Component<Auth0ProviderProps, Auth0ProviderState> {
	public state: Auth0ProviderState = {
		auth0Client: null,
		isAuthenticated: false,
		user: null,
		loading: true,
		popupOpen: false
	}

	public async componentDidMount() {
		const {
			domain,
			clientId,
			audience,
			redirectUri,
			leeway,
			onRedirectCallback = DEFAULT_REDIRECT_CALLBACK
		} = this.props;

		const auth0Client = await createAuth0Client({
			domain,
			client_id: clientId,
			redirect_uri: redirectUri,
			leeway,
			audience
		});

		if (window.location.search.includes('code=')) {
			const { appState } = await auth0Client.handleRedirectCallback();
			onRedirectCallback(appState);
		}

		const isAuthenticated = await auth0Client.isAuthenticated();
		const user = isAuthenticated ? await auth0Client.getUser() : null;

		this.setState({
			auth0Client,
			isAuthenticated,
			user,
			loading: false
		});
	}

	public loginWithPopup = async (params: PopupLoginOptions = {}) => {
		const {auth0Client} = this.state;

		if (auth0Client) {
			this.setState({popupOpen: true}, async () => {
				try {
					await auth0Client.loginWithPopup(params);
				} catch (error) {
					console.error(error);
				} finally {
					this.setState({
						popupOpen: false,
						user: await auth0Client.getUser(),
						isAuthenticated: true
					});
				}
			});
		}
	}

	public handleRedirectCallback = () => {
		const {auth0Client} = this.state;
		if (auth0Client) {
			this.setState({loading: true}, async () => {
				await auth0Client.handleRedirectCallback();
				this.setState({
					loading: false,
					isAuthenticated: true,
					user: await auth0Client.getUser()
				})
			});
		}
	}

	public render() {
		const {children} = this.props;
		const {isAuthenticated, user, loading, popupOpen, auth0Client} = this.state;

		if (!auth0Client) {
			return null;
		}

		return (
			<Auth0Context.Provider
				value={{
					isAuthenticated,
					user,
					loading,
					popupOpen,
					loginWithPopup: this.loginWithPopup,
					handleRedirectCallback: this.handleRedirectCallback,
					getIdTokenClaims: (...args: any[]) => auth0Client.getIdTokenClaims(...args),
					loginWithRedirect: (...args: any[]) => auth0Client.loginWithRedirect(...args),
					getTokenSilently: (...args: any[]) => auth0Client.getTokenSilently(...args),
					getTokenWithPopup: (...args: any[]) => auth0Client.getTokenWithPopup(...args),
					logout: (...args: any[]) => auth0Client.logout(...args)
				}}
			>
				{children}
			</Auth0Context.Provider>
		)
	}
}