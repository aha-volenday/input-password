import React, { useState } from 'react';
import { Form, Popover, Skeleton } from 'antd';
import PasswordInput from 'react-password-indicator';

const browser = typeof window !== 'undefined' ? true : false;

if (browser) require('./styles.css');

export default ({
	confirm = false,
	confirmValue = '',
	disabled = false,
	extra = null,
	id,
	inlineError = true,
	label = '',
	onBlur = () => {},
	onChange,
	onFocus = () => {},
	onPressEnter = () => {},
	onValidate,
	placeholder = '',
	required = false,
	styles = {},
	value = '',
	withLabel = false
}) => {
	const [errors, setErrors] = useState([]);
	const [errorsConfirm, setErrorsConfirm] = useState([]);
	const [isFocused, setIsFocused] = useState(false);

	const validateConfirm = confirmValue => {
		let errors = [];
		if (value !== confirmValue) errors = [...errors, "Password don't match"];
		return errors;
	};

	let onChangeConfirmTimeout = null;
	const onChangeConfirm = async (e, value) => {
		onChange(e, `Confirm${id}`, value);

		onChangeConfirmTimeout && clearTimeout(onChangeConfirmTimeout);
		onChangeConfirmTimeout = setTimeout(async () => {
			const errors = validateConfirm(value);
			setErrorsConfirm(errors);
			if (onValidate) onValidate(id, errors);
		}, 500);
	};

	const handleBlur = e => {
		setIsFocused(false);
		return onBlur(e);
	};

	const handleFocus = e => {
		setIsFocused(true);
		return onFocus(e);
	};

	let onChangeTimeout = null;
	const renderInput = () => {
		// const PasswordInput = require('react-password-indicator');
		const { Input } = require('antd');

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
					onChangeTimeout && clearTimeout(onChangeTimeout);
					onChangeTimeout = setTimeout(() => {
						const errors = e.errors.map(d => d.message);
						setErrors(errors);
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
							autoComplete="off"
							disabled={disabled}
							name={id}
							onFocus={e => handleFocus(e)}
							onBlur={e => handleBlur(e)}
							onPressEnter={onPressEnter}
							placeholder={placeholder || label || id}
							style={styles}
							value={value ? value : ''}
						/>
					</Popover>
				)}
			</PasswordInput>
		);
	};

	const renderInputConfirm = () => {
		const { Input } = require('antd');

		return (
			<Input
				autoComplete="off"
				className={'mt-2'}
				disabled={disabled}
				name={`Confirm${id}`}
				onBlur={onBlur}
				onChange={e => onChangeConfirm(e, e.target.value)}
				onPressEnter={onPressEnter}
				placeholder={`Confirm ${placeholder || label || id}`}
				style={styles}
				type="password"
				value={confirmValue ? confirmValue : ''}
			/>
		);
	};

	let formItemCommonProps = {
		colon: false,
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
	if (inlineError) formItemCommonProps = { ...formItemCommonProps, help: errors.length != 0 ? errors[0] : '' };

	let formItemCommonPropsConfirm = {
		...formItemCommonProps,
		label: withLabel ? (
			<>
				<div style={{ float: 'right' }}></div> <span class="label">Confirm {label}</span>
			</>
		) : (
			false
		),
		validateStatus: errorsConfirm.length != 0 ? 'error' : 'success'
	};
	if (inlineError)
		formItemCommonPropsConfirm = {
			...formItemCommonPropsConfirm,
			help: errorsConfirm.length != 0 ? errorsConfirm[0] : ''
		};

	return (
		<>
			<Form.Item {...formItemCommonProps}>
				{browser ? renderInput() : <Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />}
			</Form.Item>
			{confirm && (
				<Form.Item {...formItemCommonPropsConfirm}>
					{browser ? (
						renderInputConfirm()
					) : (
						<Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />
					)}
				</Form.Item>
			)}
		</>
	);
};
