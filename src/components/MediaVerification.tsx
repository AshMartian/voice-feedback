import React, { useRef } from 'react';
import {
	Accordion,
	Button,
	Modal,
	Anchor,
	Text,
} from '@mantine/core';
import { BiExpand } from 'react-icons/all';
import Bowser from 'bowser';
import {
	MediaPermissionsError,
	MediaPermissionsErrorType,
	requestMediaPermissions,
} from 'mic-check';

const browser = Bowser.getParser(window.navigator.userAgent);

enum DialogType {
	explanation = 'explanation',
	systemDenied = 'systemDenied',
	userDenied = 'userDenied',
	trackError = 'trackError',
}

const MediaVerification: React.FC = () => {
	const [showDialog, setShowDialog] = React.useState<DialogType | null>(null);

	const [audioAllowed, setAudioAllowed] = React.useState<boolean>(false);

	const [errorDetails, setErrorDetails] = React.useState<
		MediaPermissionsError | undefined
	>();

	// Create wrapper refs to access values even during setTimeout
	// https://github.com/facebook/react/issues/14010
	const showDialogRef = useRef(showDialog);
	showDialogRef.current = showDialog;
	const audioAllowedRef = useRef(audioAllowed);
	audioAllowedRef.current = audioAllowed;

	React.useEffect(() => {
		checkMediaPermissions();
	}, []);

	React.useEffect(() => {
		console.log('audio allowed permission changed: ', audioAllowed);
		if (audioAllowed) {
			// set the default devices
			// MediaManager.findMediaDevices();
		}
	}, [audioAllowed]);

	const checkForExplanationDialog = () => {
		if (
			(!audioAllowedRef.current) &&
			showDialogRef.current === null
		)
			setShowDialog(DialogType.explanation);
	};

	const checkMediaPermissions = () => {
		// TODO: listen to if there is a change on the audio/video piece?

		requestMediaPermissions({
            audio: true,
            video: false,
        })
			.then(() => {
				setAudioAllowed(true);
				setShowDialog(null);
			})
			.catch((error: MediaPermissionsError) => {
				console.log('MediaOnboardingDialog: ', error);
				if (
					error.type ===
					MediaPermissionsErrorType.SystemPermissionDenied
				) {
					// user denied permission
					setShowDialog(DialogType.systemDenied);
				} else if (
					error.type ===
					MediaPermissionsErrorType.UserPermissionDenied
				) {
					// browser doesn't have access to devices
					setShowDialog(DialogType.userDenied);
				} else if (
					error.type ===
					MediaPermissionsErrorType.CouldNotStartVideoSource
				) {
					// most likely when other apps or tabs are using the cam/mic (mostly windows)
					setShowDialog(DialogType.trackError);
				} else {
				}
				setErrorDetails(error);
			});

		setTimeout(() => {
			checkForExplanationDialog();
		}, 500);
	};

	const _renderTryAgain = (text?: string) => {
		return (
			<div style={{ width: '100%', marginTop: 20 }}>
				<Button
					onClick={() => {
						if (browser.getBrowserName() === 'Safari') {
							// If on Safari, rechecking permissions results in glitches so just refresh the page
							window.location.reload();
						} else {
							checkMediaPermissions();
						}
					}}
					color="primary"
					style={{ float: 'right' }}
				>
					{text ? text : 'Retry'}
				</Button>
			</div>
		);
	};

	const _renderErrorMessage = () => {
		if (!errorDetails) return null;
		return (
			<div style={{ marginTop: 10 }}>
				<Accordion chevron={<BiExpand />}>
					<Accordion.Item
						aria-controls="panel1a-content"
						id="panel1a-header"
                        value="Error Details"
					>
						<Text style={{ color: 'red' }}>
							Error Details
						</Text>
						<Text>
							{errorDetails.name}: {errorDetails.message}
						</Text>
					</Accordion.Item>
				</Accordion>
			</div>
		);
	};

	const _renderExplanationDialog = () => {
		return (
			<div>
				<Text component="h5">
					Allow App to use your camera and microphone
				</Text>
				<Text component="span">
					This voice analyst app needs access to your camera and microphone so the ai can hear you.
				</Text>
			</div>
		);
	};

	const _renderUserDeniedDialog = () => {
		return (
			<div>
				<Text component="h5">
					Microphone are blocked
				</Text>
				<Text>
					App requires access to your microphone.{' '}
					{browser.getBrowserName() !== 'Safari' && (
						<Text>
							Click the camera blocked icon{' '}
							<img
								alt="icon"
								src={
									'https://www.gstatic.com/meet/ic_blocked_camera_dark_f401bc8ec538ede48315b75286c1511b.svg'
								}
								style={{ display: 'inline' }}
							/>{' '}
							in your browser's address bar.
						</Text>
					)}
				</Text>
				{_renderErrorMessage()}
				{_renderTryAgain()}
			</div>
		);
	};

	const _renderSystemDeniedDialog = () => {
		const settingsDataByOS = {
			macOS: {
				name: 'System Preferences',
				link: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera',
			},
		};

		return (
			<div>
				<Text component="h5">
					Can't use your microphone
				</Text>
				<Text>
					Your browser might not have access to your
					microphone. To fix this problem, open{' '}
					{
						// @ts-ignore
						settingsDataByOS[browser.getOSName()] ? (
							<Anchor
								onClick={() => {
									window.open(
										// @ts-ignore
										settingsDataByOS[browser.getOSName()]
											.link,
										'_blank',
									);
								}}
							>
								{
									// @ts-ignore
									settingsDataByOS[browser.getOSName()].name
								}
							</Anchor>
						) : (
							'Settings'
						)
					}
					.
				</Text>
				{_renderErrorMessage()}
				{_renderTryAgain()}
			</div>
		);
	};

	const _renderTrackErrorDialog = () => {
		return (
			<div>
				<Text component="h5">
					Can't start your microphone
				</Text>
				<Text>
					Another application (Zoom, Webex) or browser tab (Google
					Meet, Messenger Video) might already be using your webcam.
					Please turn off other cameras before proceeding.
				</Text>
				{_renderErrorMessage()}
				{_renderTryAgain()}
			</div>
		);
	};

	const _renderDialogContent = () => {
		switch (showDialog) {
			case DialogType.explanation:
				return _renderExplanationDialog();
			case DialogType.systemDenied:
				return _renderSystemDeniedDialog();
			case DialogType.userDenied:
				return _renderUserDeniedDialog();
			case DialogType.trackError:
				return _renderTrackErrorDialog();
		}
	};
	return (
		<Modal opened={!!showDialog} closeOnClickOutside={false} onClose={() => {
            setShowDialog(null);
        }}>
			{showDialog && _renderDialogContent()}
            {_renderTryAgain()}
		</Modal>
	);
};

export default MediaVerification;