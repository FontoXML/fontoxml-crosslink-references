import PropTypes from 'prop-types';
import React, { Component } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import FxReferencePopover from 'fontoxml-fx/src/FxReferencePopover.jsx';
import t from 'fontoxml-localization/src/t.js';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';
import evaluateXPathToString from 'fontoxml-selectors/src/evaluateXPathToString.js';

import { PopoverBody, Text, TextLink } from 'fds/components';

const TEXT_CONTENT_TRUNCATE_LENGTH = 140;

const showMoreLabel = t('Show more');
const showPreviewLabel = t('Show preview');

const handleOpenPreview = ({ target }) =>
	operationsManager.executeOperation('open-document-preview-modal', target).catch(() => {});

const determineReferenceTextLabels = (
	{ target, metadata },
	referenceNodeId,
	referenceMarkupLabel
) => {
	const targetNode = target.nodeId
		? documentsManager.getNodeById(target.nodeId, target.documentId)
		: documentsManager.getDocumentNode(target.documentId).documentElement;

	const targetMarkupLabel = evaluateXPathToString(
		'fonto:markup-label(.)',
		targetNode,
		readOnlyBlueprint
	);
	if (!referenceMarkupLabel) {
		const referenceNode = documentsManager.getNodeById(referenceNodeId);
		referenceMarkupLabel = evaluateXPathToString(
			'fonto:markup-label(.)',
			referenceNode,
			readOnlyBlueprint
		);
	}
	let textRepresentation =
		(metadata && metadata.title) ||
		evaluateXPathToString('fonto:title-content(.)', targetNode, readOnlyBlueprint);

	if (!textRepresentation) {
		textRepresentation = evaluateXPathToString('.', targetNode, readOnlyBlueprint);
	}

	textRepresentation =
		textRepresentation.length <= TEXT_CONTENT_TRUNCATE_LENGTH
			? textRepresentation
			: textRepresentation.substr(0, TEXT_CONTENT_TRUNCATE_LENGTH - 1) + '…';

	if (textRepresentation) {
		return {
			targetMarkupLabel: targetMarkupLabel,
			referenceMarkupLabel: referenceMarkupLabel,
			previewLabel: showMoreLabel,
			textRepresentation: t('“{TEXT_REPRESENTATION}”', {
				TEXT_REPRESENTATION: textRepresentation
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
			isReadOnly: PropTypes.bool,
			referenceMarkupLabel: PropTypes.string,
			targetIsPermanentId: PropTypes.bool,
			targetQuery: PropTypes.string.isRequired
		}).isRequired,
		/**
		 * This callback will be triggered when the popover is opened or after the permanent id is
		 * resolved (if the reference has permanent ids `data.targetIsPermanentId`).
		 *
		 * @param {string} target The unresolved target, this is the resolved permanent id or
		 *    the outcome of `data.targetQuery`.
		 *
		 * @return {Promise.<CrossReferencePopover~returnObject>} The resolved target. This
		 *    should be a promise that resolves into an object.
		 */
		resolveReference: PropTypes.func.isRequired
	};

	renderReference = ({ openPreview, reference }) => {
		const referenceTextLabels = determineReferenceTextLabels(
			reference,
			this.props.data.contextNodeId,
			this.props.data.referenceMarkupLabel
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
 *
 * @typedef   {Object}  returnObject
 * @memberof  CrossReferencePopover
 * @inner
 *
 * @property  {DocumentId} documentId The document ID of the document that is referenced
 * @property  {NodeId}     [nodeId]   The node ID of the node that is referenced
 *
 * @fontosdk  members
 */

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
 * @property  {string}     [editOperationName]         Only when an editOperationName is used, a edit
 *   button is made. The edit operation should provide a way to edit the reference.
 * @property  {string}     [referenceMarkupLabel]      Provide an alternative label for this
 *   reference, provided as REFERENCE_MARKUP_LABEL to the MessageFormat for the popover's description.
 *   If omitted, the configured markup label for the reference node is used instead.
 * @property  {XPathQuery} targetQuery                 Determines the reference content with a xpath
 *   query, starting from the context node. Often this is just an attribute, for example `@href`.
 * @property  {boolean}    [targetIsPermanentId=false] Determines wether the reference contains
 *   permanentId's.
 *
 * @fontosdk  members
 */
