import React from 'react';

import { PopoverBody, Text, TextLink } from 'fds/components';

import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import t from 'fontoxml-localization/src/t.js';
import useXPath, { XPATH_RETURN_TYPES } from 'fontoxml-fx/src/useXPath.js';

const TEXT_CONTENT_TRUNCATE_LENGTH = 140;

const showMoreLabel = t('Show more');
const showPreviewLabel = t('Show preview');

function useReferenceTextLabels(contextNodeId, reference, referenceMarkupLabel) {
	const targetNode = reference.target.nodeId
		? documentsManager.getNodeById(reference.target.nodeId)
		: documentsManager.getDocumentNode(reference.target.documentId).documentElement;

	const targetMarkupLabel = useXPath('fonto:markup-label(.)', targetNode, {
		expectedResultType: XPATH_RETURN_TYPES.STRING_TYPE
	});

	const referenceNode = documentsManager.getNodeById(contextNodeId);
	const referenceMarkupLabelFallback = useXPath('fonto:markup-label(.)', referenceNode, {
		expectedResultType: XPATH_RETURN_TYPES.STRING_TYPE
	});
	if (!referenceMarkupLabel) {
		referenceMarkupLabel = referenceMarkupLabelFallback;
	}

	let titleContent = reference.metadata && reference.metadata.title;
	const titleContentFallback = useXPath(
		!titleContent &&
			`
				import module namespace fonto = "http://www.fontoxml.com/functions";
				let $titleContent := fonto:title-content(.) 
				return 
					if ($titleContent) 
					then 
						$titleContent 
					else 
						fonto:curated-text-in-node(.)
			`,
		targetNode,
		{ expectedResultType: XPATH_RETURN_TYPES.STRING_TYPE }
	);
	if (!titleContent) {
		titleContent = titleContentFallback;
	}

	titleContent =
		titleContent.length <= TEXT_CONTENT_TRUNCATE_LENGTH
			? titleContent
			: titleContent.substr(0, TEXT_CONTENT_TRUNCATE_LENGTH - 1) + '…';

	if (titleContent) {
		return {
			targetMarkupLabel: targetMarkupLabel,
			referenceMarkupLabel: referenceMarkupLabel,
			previewLabel: showMoreLabel,
			textRepresentation: t('“{TEXT_REPRESENTATION}”', {
				TEXT_REPRESENTATION: titleContent
			})
		};
	}

	return {
		targetMarkupLabel: targetMarkupLabel,
		referenceMarkupLabel: referenceMarkupLabel,
		previewLabel: showPreviewLabel,
		textRepresentation: t('This {MARKUP_LABEL} does not contain any textual content.', {
			MARKUP_LABEL: targetMarkupLabel
		})
	};
}

function CrossReferencePopoverBody({
	contextNodeId,
	openPreview,
	reference,
	referenceMarkupLabel
}) {
	const referenceTextLabels = useReferenceTextLabels(
		contextNodeId,
		reference,
		referenceMarkupLabel
	);

	return (
		<PopoverBody>
			<Text colorName="text-muted-color">
				{t(
					'{REFERENCE_MARKUP_LABEL, fonto_upper_case_first_letter} to the {REFERENCE_TARGET_MARKUP_LABEL}:',
					{
						REFERENCE_MARKUP_LABEL: referenceTextLabels.referenceMarkupLabel,
						REFERENCE_TARGET_MARKUP_LABEL: referenceTextLabels.targetMarkupLabel
					}
				)}
			</Text>

			<Text>
				{referenceTextLabels.textRepresentation}{' '}
				<TextLink label={referenceTextLabels.previewLabel} onClick={openPreview} />
			</Text>
		</PopoverBody>
	);
}

export default CrossReferencePopoverBody;
