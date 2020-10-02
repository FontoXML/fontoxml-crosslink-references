import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	TextLink
} from 'fds/components';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager.js';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview.jsx';
import t from 'fontoxml-localization/src/t.js';
import uiManager from 'fontoxml-modular-ui/src/uiManager.js';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';
import remoteDocumentStateManager from 'fontoxml-remote-documents/src/remoteDocumentStateManager.js';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/src/scrollIntoViewManager.js';

const modalTitleDefault = t('Preview link');
const closeButtonLabel = t('Close');

class DocumentPreviewModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			documentId: PropTypes.string.isRequired,
			modalIcon: PropTypes.string,
			modalTitle: PropTypes.string,
			nodeId: PropTypes.string,
			editOperationName: PropTypes.string,
			contextNodeId: PropTypes.string,
			targetQuery: PropTypes.string
		}).isRequired
	};

	componentDidMount() {
		const { nodeId } = this.props.data;
		if (nodeId) {
			nodeHighlightManager.setHighlight('target-element', nodeId);

			scrollIntoViewManager.scrollSourceNodeIntoView(
				'content-preview',
				documentsManager.getNodeById(nodeId),
				{
					alignTo: 'center',
					forceScroll: true
				}
			);
		}
	}

	handleReplaceButton = () => {
		this.props.cancelModal();

		const { editOperationName, contextNodeId } = this.props.data;
		if (editOperationName && contextNodeId) {
			operationsManager.executeOperation(editOperationName, { contextNodeId }).catch(() => {
				const {
					documentId,
					nodeId,
					editOperationName,
					contextNodeId,
					targetQuery
				} = this.props.data;

				operationsManager
					.executeOperation('open-document-preview-modal', {
						documentId,
						nodeId,
						editOperationName,
						contextNodeId,
						targetQuery
					})
					.catch(() => {});
			});
		}
	};

	handleKeyDown = event => {
		if (event.key === 'Escape' || event.key === 'Enter') {
			this.props.cancelModal();
		}
	};

	render() {
		const {
			cancelModal,
			data: { documentId, contextNodeId, modalIcon, modalTitle, editOperationName }
		} = this.props;

		const editReferenceLabel = t('Edit reference');

		const isOnEditorRoute =
			uiManager.getCurrentLocation().pathname.substr(1) === 'editor';

		// Take document id from the reference one, and see if it's out of sync
		const referrerDocumentId = documentsManager.getDocumentIdByNodeId(contextNodeId);
		const documentStatus = remoteDocumentStateManager.getState(referrerDocumentId);
		const isInSync = documentStatus.isInSync;

		const isEditReferenceAvailable = isOnEditorRoute && isInSync;

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || modalTitleDefault} icon={modalIcon || ''} />

				<ModalBody>
					<ModalContent flexDirection="column" isScrollContainer>
						<FxNodePreview documentId={documentId} />
					</ModalContent>
					{editOperationName && isEditReferenceAvailable && (
						<Flex applyCss={{ marginTop: '1em' }}>
							<TextLink
								label={editReferenceLabel}
								onClick={this.handleReplaceButton}
							/>
						</Flex>
					)}
				</ModalBody>

				<ModalFooter>
					<Button label={closeButtonLabel} type="primary" onClick={cancelModal} />
				</ModalFooter>
			</Modal>
		);
	}

	componentWillUnmount() {
		const { nodeId } = this.props.data;
		if (nodeId) {
			nodeHighlightManager.setHighlight('target-element', null);
		}
	}
}

export default DocumentPreviewModal;
