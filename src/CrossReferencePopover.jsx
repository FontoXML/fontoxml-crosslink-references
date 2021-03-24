import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import FxReferencePopover from 'fontoxml-fx/src/FxReferencePopover.jsx';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';

import CrossReferencePopoverBody from './ui/CrossReferencePopoverBody.jsx';

/**
 * A component used for making a popover for cross references.
 *
 * The CrossReferencePopover completely implements {@link FxReferencePopover} for cross referencing.
 * The only property that still needs to be added is the `resolveReference` property.
 *
 * @fontosdk
 * @react
 * @category add-on/fontoxml-crosslink-references
 */
function CrossReferencePopover({ data, ...props }) {
	const renderReference = useCallback(
		({ openPreview, reference }) => {
			return (
				<CrossReferencePopoverBody
					contextNodeId={data.contextNodeId}
					openPreview={openPreview}
					reference={reference}
					referenceMarkupLabel={data.referenceMarkupLabel}
				/>
			);
		},
		[data.contextNodeId, data.referenceMarkupLabel]
	);

	const handleOpenPreview = useCallback(
		({ target }) => {
			// The reference can only be edited from the preview modal if we have its node ID, an
			// edit operation, and are not in any way read-only. The modal does check whether the
			// reference node is read-only, but data.isReadOnly may also indicate that this popover
			// was opened from a preview...
			const canEditReference =
				!data.isReadOnly && data.editOperationName && data.contextNodeId;
			const operationData = canEditReference
				? {
						...target,
						editReferenceOperationName: data.editOperationName,
						editReferenceNodeId: data.contextNodeId
				  }
				: target;
			operationsManager
				.executeOperation('open-document-preview-modal', operationData)
				.catch(() => {});
		},
		[data.contextNodeId, data.editOperationName, data.isReadOnly]
	);

	return (
		<FxReferencePopover
			{...props}
			data={data}
			openPreview={handleOpenPreview}
			renderReference={renderReference}
		/>
	);
}

CrossReferencePopover.displayName = 'CrossReferencePopover';

CrossReferencePopover.propTypes = {
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
