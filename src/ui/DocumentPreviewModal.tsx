import type { FC, KeyboardEventHandler } from 'react';
import { useCallback, useEffect, useMemo } from 'react';

import {
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	TextLink,
} from 'fontoxml-design-system/src/components';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';
import type { ModalProps } from 'fontoxml-fx/src/types';
import useXPath from 'fontoxml-fx/src/useXPath';
import t from 'fontoxml-localization/src/t';
import operationsManager from 'fontoxml-operations/src/operationsManager';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/src/scrollIntoViewManager';
import ReturnTypes from 'fontoxml-selectors/src/ReturnTypes';
import xq from 'fontoxml-selectors/src/xq';

const modalTitleDefault = t('Preview link');
const closeButtonLabel = t('Close');

type Props = ModalProps<{
	documentId: string;
	modalIcon?: string;
	modalTitle?: string;
	nodeId?: string;
	editReferenceOperationName?: string;
	editReferenceNodeId?: string;
}>;

const DocumentPreviewModal: FC<Props> = ({ data, cancelModal }) => {
	useEffect(() => {
		const { nodeId } = data;
		if (nodeId) {
			nodeHighlightManager.setHighlight('target-element', nodeId);

			const node = documentsManager.getNodeById(nodeId);
			if (node) {
				scrollIntoViewManager.scrollSourceNodeIntoView(
					'content-preview',
					node,
					{
						alignTo: 'center',
						forceScroll: true,
					}
				);
			}
		}

		return () => {
			const { nodeId } = data;
			if (nodeId) {
				nodeHighlightManager.setHighlight('target-element', null);
			}
		};
	}, [data]);

	const handleReplaceButton = useCallback(() => {
		cancelModal();

		const { editReferenceOperationName, editReferenceNodeId } = data;
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
				} = data;

				operationsManager
					.executeOperation('open-document-preview-modal', {
						documentId,
						modalIcon,
						modalTitle,
						nodeId,
						editReferenceOperationName,
						editReferenceNodeId,
					})
					.catch(() => ({}));
			});
	}, [cancelModal, data]);

	const handleKeyDown = useCallback<KeyboardEventHandler>(
		(event) => {
			if (event.key === 'Escape' || event.key === 'Enter') {
				cancelModal();
			}
		},
		[cancelModal]
	);

	const {
		documentId,
		modalIcon,
		modalTitle,
		editReferenceOperationName,
		editReferenceNodeId,
	} = data;

	// Only show "Edit reference" link if the two props are set and the
	// reference node is not read-only.
	const referenceNode = useMemo(
		() =>
			editReferenceOperationName &&
			editReferenceNodeId &&
			documentsManager.getNodeById(editReferenceNodeId),
		[editReferenceNodeId, editReferenceOperationName]
	);

	const isReadOnly = useXPath(
		referenceNode ? xq`fonto:is-node-read-only(.)` : xq`false()`,
		referenceNode || null,
		{ expectedResultType: ReturnTypes.BOOLEAN }
	);

	return (
		<Modal size="m" onKeyDown={handleKeyDown}>
			<ModalHeader
				title={modalTitle || modalTitleDefault}
				icon={modalIcon || ''}
			/>

			<ModalBody>
				<ModalContent flexDirection="column" isScrollContainer>
					<FxNodePreview documentId={documentId} />
				</ModalContent>

				{referenceNode && !isReadOnly && (
					<Flex applyCss={{ marginTop: '1em' }}>
						<TextLink
							label={t('Edit reference')}
							onClick={handleReplaceButton}
						/>
					</Flex>
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
};

export default DocumentPreviewModal;
