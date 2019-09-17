import React, { Component, Fragment } from 'react';
import PasswordInput from 'react-password-indicator';
import InputDate from '@volenday/input-date';
import { Button, Form, Input, Popover } from 'antd';

import './styles.css';

export default class InputPassword extends Component {
	state = {
		errors: [],
		errorsConfirm: [],
		hasChange: false,
		isPopoverVisible: false,
		isFocused: false
	};

	onChangeConfirm = async value => {
		const { id, onChange, onValidate } = this.props;

		onChange(`Confirm${id}`, value);
		const errors = this.validateConfirm(value);
		await this.setState({ errorsConfirm: errors });
		if (onValidate) onValidate(id, errors);
	};

	validateConfirm = confirmValue => {
		const { value = '' } = this.props;

		let errors = [];
		if (value != confirmValue) errors = [...errors, "Password don't match"];
		return errors;
	};

	renderInput() {
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
				onChange={e => onChange(id, e)}
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
							onBlur={onBlur}
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
				name={id}
				onBlur={onBlur}
				onChange={e => this.onChangeConfirm(e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={`Confirm ${placeholder || label || id}`}
				style={styles}
				type="password"
				value={confirmValue ? confirmValue : ''}
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
