import React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

interface NumberFieldState {
	value: string;
}

function hasRedundantChars(num: string) {
	return num.match(/\.\d*0$/) || num.endsWith('.');
}

class NumberField extends React.Component<TextFieldProps, NumberFieldState> {
	public state: NumberFieldState = {
		value: '0'
	};

	public shouldComponentUpdate(nextProps: TextFieldProps, nextState: NumberFieldState) {
		return this.props.value !== nextProps.value || this.state.value !== nextState.value;
	}

	public componentDidUpdate(prevProps: TextFieldProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({value: String(this.props.value)});
		}
	}

	public handleOnChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const value = evt.target.value.replace(',', '.').replace(/^0+([^0.].*)$/, '$1');
		const valid = !isNaN(+value) || !value;

		if (valid) {
			if (value && !hasRedundantChars(value) && this.props.onChange) {
				evt.target.value = value;
				this.props.onChange(evt);
			}

			this.setState({value});
		} else {
			evt.preventDefault();
		}
	};

	public render() {
		const value = !this.state.value || hasRedundantChars(this.state.value)
			? this.state.value
			: this.props.value;
		return <TextField {...this.props} onChange={this.handleOnChange} value={value} />;
	}
}

export default NumberField;
