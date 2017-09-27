import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import FxNodePreview from 'fontoxml-fx/FxNodePreview.jsx';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/nodeHighlightManager';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/scrollIntoViewManager';
import t from 'fontoxml-localization/t';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from 'fontoxml-vendor-fds/components';

const modalTitleDefault = t('Preview link');
const closeButtonLabel = t('Close');

class DocumentPreviewModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			documentId: PropTypes.string.isRequired,
			modalIcon: PropTypes.string,
			modalTitle: PropTypes.string,
			nodeId: PropTypes.string
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

	handleKeyDown = event => {
		if (event.key === 'Escape' || event.key === 'Enter') {
			this.props.cancelModal();
		}
	};

	render() {
		const { cancelModal, data: { documentId, modalIcon, modalTitle } } = this.props;

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || modalTitleDefault} icon={modalIcon || ''} />

				<ModalBody>
					<ModalContent flexDirection="column" isScrollContainer>
						<FxNodePreview documentId={documentId} />
					</ModalContent>
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
