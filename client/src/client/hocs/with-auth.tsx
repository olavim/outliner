import React from 'react';
import {Auth0ContextProps, Auth0Context} from '@/Auth0Provider';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface WithAuthProps {
	auth: Auth0ContextProps;
}

export default function withAuth<P extends WithAuthProps>(Component: React.ComponentType<P>) {
	return function BoundComponent(props: Omit<P, 'auth'>) {
		return (
			<Auth0Context.Consumer>
				{context => <Component {...(props as any)} auth={context} />}
			</Auth0Context.Consumer>
		);
	};
}
