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
import operationsManager from 'fontoxml-operations/src/operationsManager.js';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/src/scrollIntoViewManager.js';
import uiManager from 'fontoxml-modular-ui/src/uiManager.js';

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
			editReferenceOperationName: PropTypes.string,
			editReferenceNodeId: PropTypes.string
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

		const { editReferenceOperationName, editReferenceNodeId } = this.props.data;
		if (editReferenceOperationName && editReferenceNodeId) {
			operationsManager
				.executeOperation(editReferenceOperationName, {
					contextNodeId: editReferenceNodeId
				})
				.catch(() => {
					const {
						documentId,
						modalIcon,
						modalTitle,
						nodeId,
						// eslint-disable-next-line no-shadow
						editReferenceOperationName,
						// eslint-disable-next-line no-shadow
						editReferenceNodeId
					} = this.props.data;

					operationsManager
						.executeOperation('open-document-preview-modal', {
							documentId,
							modalIcon,
							modalTitle,
							nodeId,
							editReferenceOperationName,
							editReferenceNodeId
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
			data: { documentId, modalIcon, modalTitle, editOperationName }
		} = this.props;

		const editReferenceLabel = t('Edit reference');

		const availableEditReference =
			uiManager.getCurrentLocation().pathname.substr(1) === 'editor';

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || modalTitleDefault} icon={modalIcon || ''} />

				<ModalBody>
					<ModalContent flexDirection="column" isScrollContainer>
						<FxNodePreview documentId={documentId} />
					</ModalContent>
					{editOperationName && availableEditReference && (
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
