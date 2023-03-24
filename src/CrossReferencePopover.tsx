import * as React from 'react';

import type { DocumentId } from 'fontoxml-documents/src/types';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import FxReferencePopover from 'fontoxml-fx/src/FxReferencePopover';
import operationsManager from 'fontoxml-operations/src/operationsManager';

import CrossReferencePopoverBody from './ui/CrossReferencePopoverBody';

/**
 * @remarks
 * A component used for making a popover for cross references.
 *
 * The CrossReferencePopover completely implements {@link FxReferencePopover} for
 * cross referencing. The only property that still needs to be added is the
 * `resolveReference` property.
 *
 * @fontosdk importable
 */
const CrossReferencePopover: React.FC<{
	/**
	 * @remarks
	 * The popoverData as provided by the family configuration, this only needs to be
	 * passed through.
	 *
	 * @fontosdk
	 */
	data: {
		/**
		 * @remarks
		 * A property that comes from the popover method self, contains the node ID of the
		 * node that is configured.
		 *
		 * @fontosdk
		 */
		contextNodeId: string;
		/**
		 * @remarks
		 * The operation for removing the reference. Is by default {@link
		 * reference-delete}.
		 *
		 * @fontosdk
		 */
		deleteOperationName?: string;
		/**
		 * @remarks
		 * Only when an editOperationName is used, a edit button is made. The edit
		 * operation should provide a way to edit the reference.
		 *
		 * @fontosdk
		 */
		editOperationName?: string;
		/**
		 * @fontosdk
		 */
		isReadOnly?: boolean;
		/**
		 * @remarks
		 * Provide an alternative label for this reference, provided as
		 * REFERENCE_MARKUP_LABEL to the MessageFormat for the popover's description. If
		 * omitted, the configured markup label for the reference node is used instead.
		 *
		 * @fontosdk
		 */
		referenceMarkupLabel?: string;
		/**
		 * @remarks
		 * Determines wether the reference contains permanentId's.
		 *
		 * @fontosdk
		 */
		targetIsPermanentId?: boolean;
		/**
		 * @remarks
		 * Determines the reference content with a xpath query, starting from the context
		 * node. Often this is just an attribute, for example `@href`.
		 *
		 * @fontosdk
		 */
		targetQuery: string;
	};
	/**
	 * @remarks
	 * This callback will be triggered when the popover is opened or after the
	 * permanent id is resolved (if the reference has permanent ids
	 * `data.targetIsPermanentId`).
	 *
	 * @fontosdk
	 *
	 * @param target - The unresolved target, this is the resolved permanent id or the outcome of
	 *                 `data.targetQuery`.
	 *
	 * @returns The resolved target. This should be a promise that resolves into an object.
	 */
	resolveReference(target: string): Promise<{
		/**
		 * @remarks
		 * The document ID of the document that is referenced
		 *
		 * @fontosdk
		 */
		documentId: DocumentId;
		/**
		 * @remarks
		 * The node ID of the node that is referenced
		 *
		 * @fontosdk
		 */
		nodeId?: NodeId;
	}>;
}> = ({ data, ...props }) => {
	const renderReference = React.useCallback(
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

	const handleOpenPreview = React.useCallback(
		({ target }) => {
			// The reference can only be edited from the preview modal if we have its node ID, an
			// edit operation, and are not in any way read-only. The modal does check whether the
			// reference node is read-only, but data.isReadOnly may also indicate that this popover
			// was opened from a preview...
			const canEditReference =
				!data.isReadOnly &&
				data.editOperationName &&
				data.contextNodeId;
			const operationData = canEditReference
				? {
						...target,
						editReferenceOperationName: data.editOperationName,
						editReferenceNodeId: data.contextNodeId,
				  }
				: target;
			operationsManager
				.executeOperation('open-document-preview-modal', operationData)
				.catch(() => undefined);
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
};

CrossReferencePopover.displayName = 'CrossReferencePopover';

export default CrossReferencePopover;
