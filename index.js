import React, { Component, Fragment } from 'react';
import PasswordInput from 'react-password-indicator';
import InputDate from '@volenday/input-date';
import { Button, Form, Input, Popover } from 'antd';

import './styles.css';

export default class InputPassword extends Component {
	initialState = {
		errors: [],
		errorsConfirm: [],
		hasChange: false,
		isPopoverVisible: false,
		localValue: '',
		localConfirmValue: '',
		isFocused: false
	};
	state = { ...this.initialState, initialState: this.initialState };

	static getDerivedStateFromProps(nextProps, prevState) {
		// Set initial localValue
		if (nextProps.value && !prevState.localValue) {
			return { ...prevState, localValue: nextProps.value, localConfirmValue: nextProps.confirmValue };
		}

		// Resets equivalent value
		if (prevState.localValue !== nextProps.value) {
			// For Add
			if (typeof nextProps.value === 'undefined' && !prevState.hasChange && !prevState.isFocused) {
				return { ...prevState.initialState };
			}

			// For Edit
			if (!prevState.isFocused) {
				return {
					...prevState.initialState,
					localValue: nextProps.value,
					localConfirmValue: nextProps.confirmValue
				};
			}
		}

		return null;
	}

	onChange = value => {
		const { action } = this.props;
		this.setState({ localValue: value, hasChange: action === 'add' ? false : true });
	};

	onChangeConfirm = async value => {
		const { localConfirmValue } = this.state;
		const { action, id, onChange, onValidate } = this.props;

		if (localConfirmValue != '' && value == '') onChange(`Confirm${id}`, value);
		const errors = this.validateConfirm(value);
		await this.setState({
			errorsConfirm: errors,
			localConfirmValue: value,
			hasChange: action === 'add' ? false : true
		});
		if (onValidate) onValidate(id, errors);
	};

	validateConfirm = value => {
		const { localValue = '' } = this.state;

		let errors = [];
		if (localValue != value) errors = [...errors, "Password don't match"];
		return errors;
	};

	renderInput() {
		const { localValue } = this.state;
		const {
			disabled = false,
			id,
			label = '',
			onChange,
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
				onChange={e => {
					if (localValue != '' && e == '') onChange(id, e);
					this.onChange(e);
				}}
				onValidate={e => {
					const errors = e.errors.map(d => d.message);
					this.setState({ errors });
					if (onValidate) onValidate(id, errors);
				}}>
				{({ getInputProps, hasRulePassed, rules }) => (
					<Popover
						zIndex={9999}
						placement="topLeft"
						content={
							<ul class="list-group">
								{rules.map(r => (
									<li class="list-group-item" key={r.key}>
										{hasRulePassed(r.key) && localValue ? (
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
							onBlur={e => {
								if (e.target.value != value) onChange(id, e.target.value);
								this.setState({ isFocused: false });
							}}
							onFocus={() => this.setState({ isFocused: true })}
							onPressEnter={e => {
								onChange(id, e.target.value);
								return true;
							}}
							placeholder={placeholder || label || id}
							style={styles}
							value={localValue ? localValue : ''}
						/>
					</Popover>
				)}
			</PasswordInput>
		);
	}

	renderInputConfirm() {
		const { localConfirmValue } = this.state;
		const {
			confirmValue = '',
			disabled = false,
			id,
			label = '',
			onChange,
			placeholder = '',
			styles = {}
		} = this.props;

		return (
			<Input
				allowClear
				autoComplete="off"
				className={'mt-2'}
				disabled={disabled}
				name={id}
				onBlur={e => {
					if (e.target.value != confirmValue) onChange(`Confirm${id}`, e.target.value);
					this.setState({ isFocused: false });
				}}
				onChange={e => this.onChangeConfirm(e.target.value)}
				onFocus={() => this.setState({ isFocused: true })}
				onPressEnter={e => {
					onChange(`Confirm${id}`, e.target.value);
					return true;
				}}
				placeholder={`Confirm ${placeholder || label || id}`}
				style={styles}
				type="password"
				value={localConfirmValue ? localConfirmValue : ''}
			/>
		);
	}

	handlePopoverVisible = visible => {
		this.setState({ isPopoverVisible: visible });
	};

	renderPopover = () => {
		const { isPopoverVisible } = this.state;
		const { id, label = '', historyTrackValue = '', onHistoryTrackChange } = this.props;

		return (
			<Popover
				content={
					<InputDate
						id={id}
						label={label}
						required={true}
						withTime={true}
						withLabel={true}
						value={historyTrackValue}
						onChange={onHistoryTrackChange}
					/>
				}
				trigger="click"
				title="History Track"
				visible={isPopoverVisible}
				onVisibleChange={this.handlePopoverVisible}>
				<span class="float-right">
					<Button
						type="link"
						shape="circle-outline"
						icon="warning"
						size="small"
						style={{ color: '#ffc107' }}
					/>
				</span>
			</Popover>
		);
	};

	render() {
		const { errors, errorsConfirm, hasChange } = this.state;
		const {
			action,
			confirm = false,
			label = '',
			required = false,
			withLabel = false,
			historyTrack = false
		} = this.props;

		const formItemCommonProps = {
			colon: false,
			help: errors.length != 0 ? errors[0] : '',
			label: withLabel ? label : false,
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
				<Form.Item {...formItemCommonProps}>
					{historyTrack && hasChange && action !== 'add' && this.renderPopover()}
					{this.renderInput()}
				</Form.Item>
				{confirm && <Form.Item {...formItemCommonPropsConfirm}>{this.renderInputConfirm()}</Form.Item>}
			</Fragment>
		);
	}
}
