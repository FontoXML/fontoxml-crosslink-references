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
	TextLink,
} from 'fds/components';

import documentsManager from 'fontoxml-documents/src/documentsManager';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';
import FxXPath, { XPATH_RETURN_TYPES } from 'fontoxml-fx/src/FxXPath';
import t from 'fontoxml-localization/src/t';
import operationsManager from 'fontoxml-operations/src/operationsManager';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/src/scrollIntoViewManager';

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
			editReferenceNodeId: PropTypes.string,
		}).isRequired,
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
					forceScroll: true,
				}
			);
		}
	}

	handleReplaceButton = () => {
		this.props.cancelModal();

		const { editReferenceOperationName, editReferenceNodeId } =
			this.props.data;
		operationsManager
			.executeOperation(editReferenceOperationName, {
				contextNodeId: editReferenceNodeId,
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
					editReferenceNodeId,
				} = this.props.data;

				operationsManager
					.executeOperation('open-document-preview-modal', {
						documentId,
						modalIcon,
						modalTitle,
						nodeId,
						editReferenceOperationName,
						editReferenceNodeId,
					})
					.catch(() => {});
			});
	};

	handleKeyDown = (event) => {
		if (event.key === 'Escape' || event.key === 'Enter') {
			this.props.cancelModal();
		}
	};

	render() {
		const {
			cancelModal,
			data: {
				documentId,
				modalIcon,
				modalTitle,
				editReferenceOperationName,
				editReferenceNodeId,
			},
		} = this.props;

		// Only show "Edit reference" link if the two props are set and the reference node is  not
		// read-only
		const referenceNode =
			editReferenceOperationName &&
			editReferenceNodeId &&
			documentsManager.getNodeById(editReferenceNodeId);

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader
					title={modalTitle || modalTitleDefault}
					icon={modalIcon || ''}
				/>

				<ModalBody>
					<ModalContent flexDirection="column" isScrollContainer>
						<FxNodePreview documentId={documentId} />
					</ModalContent>
					{referenceNode && (
						<FxXPath
							expression="fonto:is-node-read-only(.)"
							context={referenceNode}
							returnType={XPATH_RETURN_TYPES.BOOLEAN_TYPE}
						>
							{(isReadOnly) =>
								!isReadOnly && (
									<Flex applyCss={{ marginTop: '1em' }}>
										<TextLink
											label={t('Edit reference')}
											onClick={this.handleReplaceButton}
										/>
									</Flex>
								)
							}
						</FxXPath>
					)}
				</ModalBody>

				<ModalFooter>
					<Button
						label={closeButtonLabel}
						type="primary"
						onClick={cancelModal}
					/>
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
