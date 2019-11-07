import React, { Component, Fragment } from 'react';
import PasswordInput from 'react-password-indicator';
import { Form, Input, Popover } from 'antd';

import './styles.css';

export default class InputPassword extends Component {
	state = {
		errors: [],
		errorsConfirm: [],
		isFocused: false
	};

	onChangeConfirmTimeout = null;
	onChangeConfirm = async (e, value) => {
		const { id, onChange, onValidate } = this.props;

		onChange(e, `Confirm${id}`, value);

		this.onChangeConfirmTimeout && clearTimeout(this.onChangeConfirmTimeout);
		this.onChangeConfirmTimeout = setTimeout(async () => {
			const errors = this.validateConfirm(value);
			await this.setState({ errorsConfirm: errors });
			if (onValidate) onValidate(id, errors);
		}, 500);
	};

	validateConfirm = confirmValue => {
		const { value = '' } = this.props;

		let errors = [];
		if (value != confirmValue) errors = [...errors, "Password don't match"];
		return errors;
	};

	onBlur(event) {
		const { onBlur = () => {} } = this.props;

		this.setState({ isFocused: false });
		return onBlur(event);
	}

	onFocus(event) {
		this.setState({ isFocused: true });
	}

	onChangeTimeout = null;
	renderInput() {
		const { isFocused } = this.state;
		const {
			disabled = false,
			id,
			label = '',
			onBlur = () => {},
			onChange,
			onPressEnter = () => {},
			onValidate,
			placeholder = '',
			styles = {},
			value = ''
		} = this.props;

		return (
			<PasswordInput
				defaultMessages={{
					maxLen: e => `Maximum length is ${e}`
				}}
				minLen={6}
				maxLen={32}
				digits={1}
				specialChars={1}
				uppercaseChars={1}
				onChange={e => onChange({ target: { name: id, value: e } }, id, e)}
				onValidate={e => {
					this.onChangeTimeout && clearTimeout(this.onChangeTimeout);
					this.onChangeTimeout = setTimeout(() => {
						const errors = e.errors.map(d => d.message);
						this.setState({ errors });
						if (onValidate) onValidate(id, errors);
					}, 500);
				}}>
				{({ getInputProps, hasRulePassed, rules }) => (
					<Popover
						visible={isFocused}
						zIndex={9999}
						placement="topLeft"
						content={
							<ul class="list-group">
								{rules.map(r => (
									<li class="list-group-item" key={r.key}>
										{hasRulePassed(r.key) && value ? (
											<i
												class="fas fa-check-circle"
												style={{
													color: 'green'
												}}
											/>
										) : (
											<i
												class="fas fa-times-circle"
												style={{
													color: 'red'
												}}
											/>
										)}{' '}
										{r.message}
									</li>
								))}
							</ul>
						}
						title="Password Rules"
						trigger="click">
						<Input
							{...getInputProps()}
							allowClear
							autoComplete="off"
							disabled={disabled}
							name={id}
							onFocus={e => this.onFocus(e)}
							onBlur={e => this.onBlur(e)}
							onPressEnter={onPressEnter}
							placeholder={placeholder || label || id}
							style={styles}
							value={value ? value : ''}
						/>
					</Popover>
				)}
			</PasswordInput>
		);
	}

	renderInputConfirm() {
		const {
			confirmValue = '',
			disabled = false,
			id,
			label = '',
			onBlur = () => {},
			onPressEnter = () => {},
			placeholder = '',
			styles = {}
		} = this.props;

		return (
			<Input
				allowClear
				autoComplete="off"
				className={'mt-2'}
				disabled={disabled}
				name={`Confirm${id}`}
				onBlur={onBlur}
				onChange={e => this.onChangeConfirm(e, e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={`Confirm ${placeholder || label || id}`}
				style={styles}
				type="password"
				value={confirmValue ? confirmValue : ''}
			/>
		);
	}

	render() {
		const { errors, errorsConfirm } = this.state;
		const { confirm = false, extra = null, label = '', required = false, withLabel = false } = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? (
				<>
					<div style={{ float: 'right' }}>{extra}</div> <span class="label">{label}</span>
				</>
			) : (
				false
			),
			required,
			validateStatus: errors.length != 0 ? 'error' : 'success'
		};
		const formItemCommonPropsConfirm = {
			...formItemCommonProps,
			help: errorsConfirm.length != 0 ? errorsConfirm[0] : '',
			label: withLabel ? `Confirm ${label}` : false,
			validateStatus: errorsConfirm.length != 0 ? 'error' : 'success'
		};

		return (
			<Fragment>
				<Form.Item {...formItemCommonProps}>{this.renderInput()}</Form.Item>
				{confirm && <Form.Item {...formItemCommonPropsConfirm}>{this.renderInputConfirm()}</Form.Item>}
			</Fragment>
		);
	}
}
