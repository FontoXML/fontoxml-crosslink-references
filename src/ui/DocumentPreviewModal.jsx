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
import operationsManager from 'fontoxml-operations/src/operationsManager.js';
import t from 'fontoxml-localization/src/t.js';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/src/scrollIntoViewManager.js';

const modalTitleDefault = t('Preview link');
const closeButtonLabel = t('Close');

function determineEditReferenceLabel(targetQuery) {
	if (targetQuery === '@conref') {
		return t('Edit conref');
	} else if (targetQuery === '@href') {
		return t('Edit cross link');
	}

	return t('Edit reference');
}

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
			operationsManager.executeOperation(editOperationName, { contextNodeId });
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
			data: { documentId, modalIcon, modalTitle, editOperationName, targetQuery }
		} = this.props;

		const editReferenceLabel = determineEditReferenceLabel(targetQuery);

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || modalTitleDefault} icon={modalIcon || ''} />

				<ModalBody>
					<ModalContent flexDirection="column" isScrollContainer>
						<FxNodePreview documentId={documentId} />
					</ModalContent>
					{editOperationName && (
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
