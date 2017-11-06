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

import { PopoverBody, Text, TextLink } from 'fds/components';

const TEXT_CONTENT_TRUNCATE_LENGTH = 140;

const showMoreLabel = t('Show more');
const showPreviewLabel = t('Show preview');
const noTextualRepresentationLabel = markupLabel =>
	t('This {MARKUP_LABEL} does not contain any textual content. ', { MARKUP_LABEL: markupLabel });

const handleOpenPreview = ({ target }) =>
	operationsManager.executeOperation('open-document-preview-modal', target).catch(() => {});

const determineReferenceTextLabels = ({ target, metadata }) => {
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
		// Do not respect word boundaries to avoid truncation bug, see also FXC-1546
		false
	);

	if (textRepresentation) {
		return {
			markupLabel: markupLabel,
			previewLabel: showMoreLabel,
			textRepresentation: t('“{TEXT_REPRESENTATION}” ', {
				TEXT_REPRESENTATION: textRepresentation
			})
		};
	}

	return {
		markupLabel: markupLabel,
		previewLabel: showPreviewLabel,
		textRepresentation: noTextualRepresentationLabel(markupLabel)
	};
};

/**
 * A component used for making a popover for cross references.
 *
 * The CrossReferencePopover completely implements {@link FxReferencePopover} for cross referencing.
 * The only property that still needs to be added is the `resolveReference` property.
 *
 * @fontosdk
 * @category add-on/fontoxml-crosslink-references
 */
class CrossReferencePopover extends Component {
	static propTypes = {
		/**
		 * @type {CrossReferencePopover~data}
		 */
		data: PropTypes.shape({
			contextNodeId: PropTypes.string.isRequired,
			deleteOperationName: PropTypes.string,
			editOperationName: PropTypes.string,
			targetIsPermanentId: PropTypes.bool,
			targetQuery: PropTypes.string.isRequired
		}).isRequired,
		/**
		 * This callback will be triggered when the popover is opened or after the permanent id is
		 * resolved (if the reference has permanent ids `data.targetIsPermanentId`).
		 *
		 * @param {string} target The unresolved target, this is the resolved permanent id or
		 * the outcome of `data.targetQuery`.
		 *
		 * @return {Promise.<string|Object>} The resolved target.
		 */
		resolveReference: PropTypes.func.isRequired
	};

	renderReference = ({ openPreview, reference }) => {
		const referenceTextLabels = determineReferenceTextLabels(reference);

		return (
			<PopoverBody>
				<Text colorName="text-muted-color">
					{t('Cross link to the {REFERENCE_MARKUP_LABEL}:', {
						REFERENCE_MARKUP_LABEL: referenceTextLabels.markupLabel
					})}
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

export default CrossReferencePopover;

/**
 * The popoverData as provided by the family configuration, this only needs to be passed through.
 *
 * @typedef   {Object}  data
 * @memberof  CrossReferencePopover
 * @inner
 *
 * @property  {NodeId}     contextNodeId               A property that comes from the popover method
 *   self, contains the node ID of the node that is configured.
 * @property  {string}     [deleteOperationName='reference-delete'] The operation for removing the
 *   reference. Is by default {@link reference-delete}.
 * @property  {boolean}    [editOperationName]         Only when an editOperationName is used, a edit
 *   button is made. The edit operation should provide a way to edit the reference.
 * @property  {XPathQuery} targetQuery                 Determines the reference content with a xpath
 *   query, starting from the context node. Often this is just an attribute, for example `@href`.
 * @property  {boolean}    [targetIsPermanentId=false] Determines wether the reference contains
 *   permanentId's.
 *
 * @fontosdk  members
 */
