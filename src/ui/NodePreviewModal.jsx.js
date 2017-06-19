import React from 'react';

import FxNodePreview from 'fontoxml-fx/FxNodePreview.jsx';

import {
	Button,
	Container,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalToolbar
} from 'fontoxml-vendor-fds/components';

import reactToAngularModalBridge from '../bridge/reactToAngularModalBridge';

export default function NodePreviewModal () {
	const {
		operationData,
		closeModal
	} = reactToAngularModalBridge;
	return (
		<Modal size='s'>
			<ModalHeader
				title={ operationData.modalTitle }
				icon={ operationData.modalIcon }
			/>
			<ModalBody paddingSize='l'>
				<ModalContent>
					<Container applyCss={ { overflow: 'auto', width: '100%' } }>
						<FxNodePreview
							nodeId={ operationData.documentNodeId }
							highlightNodeId={ operationData.highlightNodeId }
						/>
					</Container>
				</ModalContent>
			</ModalBody>
			<ModalFooter>
				<Button
					type='primary'
					label={ operationData.modalCancelButtonLabel }
					onClick={ closeModal }
				/>
			</ModalFooter>
		</Modal>
	);
}
