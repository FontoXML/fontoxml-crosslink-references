import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import FxTemplatedView from 'fontoxml-templated-views/FxTemplatedView.jsx';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/nodeHighlightManager';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/scrollIntoViewManager';
import t from 'fontoxml-localization/t';

import {
	Block,
	Button,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader
} from 'fontoxml-vendor-fds/components';

import { scrollContainer } from 'fontoxml-vendor-fds/system';

const modalTitleDefault = t('Preview document');
const closeButtonLabel = t('Close');

const scrollContainerStyles = scrollContainer('s');

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

	render() {
		const { cancelModal, data: { documentId, modalIcon, modalTitle } } = this.props;

		return (
			<Modal size="m">
				<ModalHeader title={modalTitle || modalTitleDefault} icon={modalIcon || ''} />
				<ModalBody>
					<Block applyCss={scrollContainerStyles} flex="auto">
						<FxTemplatedView
							documentId={documentId}
							flags={{ readonly: true }}
							mode="preview"
							overrideMode=""
							paddingSize={0}
							stylesheetName="content"
							viewName="content-preview"
						/>
					</Block>
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
