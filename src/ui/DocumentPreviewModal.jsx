import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from 'fds/components';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager.js';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview.jsx';
import t from 'fontoxml-localization/src/t.js';
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
		const {
			cancelModal,
			data: { documentId, modalIcon, modalTitle }
		} = this.props;

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
