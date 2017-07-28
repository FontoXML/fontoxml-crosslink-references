import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import domQuery from 'fontoxml-dom-utils/domQuery';
import FxReferencePopover from 'fontoxml-fx/FxReferencePopover.jsx';
import getMarkupLabel from 'fontoxml-markup-documentation/getMarkupLabel';
import getTitleContent from 'fontoxml-markup-documentation/getTitleContent';
import operationsManager from 'fontoxml-operations/operationsManager';
import t from 'fontoxml-localization/t';
import truncator from 'fontoxml-utils/truncator';

import { PopoverBody, Text, TextLink } from 'fontoxml-vendor-fds/components';

const TEXT_CONTENT_TRUNCATE_LENGTH = 140;

const crossLinkToLabel = t('Cross link to the ');
const showMoreLabel = t('Show more');
const showPreviewLabel = t('Show preview');
const noTextualRepresentationLabel = markupLabel =>
	t('This {MARKUP_LABEL} does not contain any textual content. ', { MARKUP_LABEL: markupLabel });

const handleOpenPreview = ({ target }) =>
	operationsManager.executeOperation('open-document-preview-modal', target)
		.catch(() => {});

const determineReferenceTextLabels = ({ target, metadata}) => {
	const targetNode = target.nodeId
		? documentsManager.getNodeById(target.nodeId, target.documentId)
		: documentsManager.getDocumentNode(target.documentId).documentElement;

	const markupLabel = getMarkupLabel(targetNode) || targetNode.nodeName;
	let textRepresentation = (metadata && metadata.title) || getTitleContent(targetNode);

	if (!textRepresentation) {
		textRepresentation = domQuery.getTextContent(targetNode);
	}

	textRepresentation = truncator.truncateRight(
		textRepresentation,
		TEXT_CONTENT_TRUNCATE_LENGTH,
		false // Do not respect word boundaries to avoid truncation bug, see also FXC-1546
	);

	if (textRepresentation) {
		return {
			markupLabel: markupLabel,
			previewLabel: showMoreLabel,
			textRepresentation: '“' + textRepresentation + '” '
		};
	}

	return {
		markupLabel: markupLabel,
		previewLabel: showPreviewLabel,
		textRepresentation: noTextualRepresentationLabel(markupLabel)
	};
};

class FxCrossReferencePopover extends Component {
	static propTypes = {
		data: PropTypes.shape({
			contextNodeId: PropTypes.string.isRequired,
			deleteOperationName: PropTypes.string,
			editOperationName: PropTypes.string,
			targetIsPermanentId: PropTypes.bool,
			targetQuery: PropTypes.string
		}).isRequired,
		resolveReference: PropTypes.func.isRequired
	};

	renderReference = ({ openPreview, reference }) => {
		const referenceTextLabels = determineReferenceTextLabels(reference);

		return (
			<PopoverBody>
				<Text colorName="text-muted-color">
					{crossLinkToLabel + referenceTextLabels.markupLabel + ':'}
				</Text>

				<Text>
					{referenceTextLabels.textRepresentation}

					<TextLink label={referenceTextLabels.previewLabel} onClick={openPreview} />
				</Text>
			</PopoverBody>
		);
	};

	render() {
		return (
			<FxReferencePopover
				{...this.props}
				openPreview={handleOpenPreview}
				renderReference={this.renderReference}
			/>
		);
	}
}

export default FxCrossReferencePopover;
