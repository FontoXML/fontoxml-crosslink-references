import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

import blueprintQuery from 'fontoxml-blueprints/src/blueprintQuery';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import {
	PopoverBody,
	Text,
	TextLink,
} from 'fontoxml-design-system/src/components';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { DocumentId } from 'fontoxml-documents/src/types';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import domInfo from 'fontoxml-dom-utils/src/domInfo';
import useOperation from 'fontoxml-fx/src/useOperation';
import useXPath from 'fontoxml-fx/src/useXPath';
import t from 'fontoxml-localization/src/t';
import type { OperationName } from 'fontoxml-operations/src/types';
import ReturnTypes from 'fontoxml-selectors/src/ReturnTypes';
import xq from 'fontoxml-selectors/src/xq';

const TEXT_CONTENT_TRUNCATE_LENGTH = 140;

const CrossReferencePopoverBody: FC<{
	contextNodeId: NodeId;
	targetDocumentId: DocumentId;
	targetNodeId?: NodeId;
	editOperationName?: OperationName;
	referenceMarkupLabel?: string;
	titleContent?: string;
}> = ({
	contextNodeId,
	targetDocumentId,
	targetNodeId,
	editOperationName,
	referenceMarkupLabel,
	titleContent,
}) => {
	const contextNode = useMemo(
		() => documentsManager.getNodeById(contextNodeId),
		[contextNodeId]
	);
	const referenceMarkupLabelFallback = useXPath(
		referenceMarkupLabel ? null : xq`fonto:markup-label(.)`,
		contextNode,
		{ expectedResultType: ReturnTypes.STRING }
	);

	const targetNode = useMemo(() => {
		if (targetNodeId) {
			return documentsManager.getNodeById(targetNodeId);
		}
		const documentNode = documentsManager.getDocumentNode(targetDocumentId);
		// Get the root element of the target document
		return (
			documentNode &&
			blueprintQuery.findChild(
				readOnlyBlueprint,
				documentNode,
				domInfo.isElement
			)
		);
	}, [targetNodeId, targetDocumentId]);

	const targetMarkupLabel = useXPath(xq`fonto:markup-label(.)`, targetNode, {
		expectedResultType: ReturnTypes.STRING,
	});

	const titleContentFallback = useXPath<string>(
		titleContent
			? null
			: xq`let $titleContent := fonto:title-content(.)
			return if ($titleContent)
				then $titleContent
				else fonto:curated-text-in-node(.)
		`,
		targetNode,
		{ expectedResultType: ReturnTypes.STRING }
	);

	const textRepresentation = useMemo(() => {
		let title = titleContent ?? titleContentFallback ?? '';
		if (title.length > TEXT_CONTENT_TRUNCATE_LENGTH) {
			title = `${title.substr(0, TEXT_CONTENT_TRUNCATE_LENGTH - 1)}…`;
		}
		if (title) {
			return t('“{TEXT_REPRESENTATION}”', {
				TEXT_REPRESENTATION: title,
			});
		}

		return t('This {MARKUP_LABEL} does not contain any textual content.', {
			MARKUP_LABEL: targetMarkupLabel,
		});
	}, [targetMarkupLabel, titleContent, titleContentFallback]);

	const previewLabel =
		titleContent ?? titleContentFallback
			? t('Show more')
			: t('Show preview');

	const previewOperationData = useMemo(() => {
		// The reference can only be edited from the preview modal if we
		// have its node ID, an edit operation, and are not in any way
		// read-only. The modal does check whether the reference node is
		// read-only, but data.isReadOnly may also indicate that this
		// popover was opened from a preview...
		return editOperationName
			? {
					documentId: targetDocumentId,
					nodeId: targetNodeId,
					editReferenceOperationName: editOperationName,
					editReferenceNodeId: contextNodeId,
			  }
			: {
					documentId: targetDocumentId,
					nodeId: targetNodeId,
			  };
	}, [editOperationName, targetDocumentId, targetNodeId, contextNodeId]);
	const { executeOperation } = useOperation(
		'open-document-preview-modal',
		previewOperationData
	);
	const openPreview = useCallback(
		() => executeOperation(),
		[executeOperation]
	);

	return (
		<PopoverBody>
			<Text colorName="text-muted-color">
				{t(
					'{REFERENCE_MARKUP_LABEL, fonto_upper_case_first_letter} to the {REFERENCE_TARGET_MARKUP_LABEL}:',
					{
						REFERENCE_MARKUP_LABEL:
							referenceMarkupLabel ??
							referenceMarkupLabelFallback,
						REFERENCE_TARGET_MARKUP_LABEL: targetMarkupLabel,
					}
				)}
			</Text>

			<Text>
				{textRepresentation}{' '}
				<TextLink label={previewLabel} onClick={openPreview} />
			</Text>
		</PopoverBody>
	);
};

export default CrossReferencePopoverBody;
