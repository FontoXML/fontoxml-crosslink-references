import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
	CompactStateMessage,
	Popover,
	PopoverBody,
	PopoverFooter,
	SpinnerIcon,
} from 'fontoxml-design-system/src/components';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { DocumentId } from 'fontoxml-documents/src/types';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import FxOperationButton from 'fontoxml-fx/src/FxOperationButton';
import useXPath from 'fontoxml-fx/src/useXPath';
import t from 'fontoxml-localization/src/t';
import type { OperationName } from 'fontoxml-operations/src/types';
import referencesManager from 'fontoxml-references/src/referencesManager';
import type { ReferenceMetadata } from 'fontoxml-references/src/types';
import ReturnTypes from 'fontoxml-selectors/src/ReturnTypes';
import type { XPathQuery, XQExpression } from 'fontoxml-selectors/src/types';

import CrossReferencePopoverBody from './ui/CrossReferencePopoverBody';

/**
 * Popover data passed to components implementing the CrossReferencePopover.
 *
 * Specify these values using the `popoverData` CVK option
 * ({@link CvkPopoverData}).
 *
 * @fontosdk importable
 */
export type CrossReferencePopoverData = {
	/**
	 * @remarks
	 * A property that comes from the popover method self, contains the node ID
	 * of the node that is configured.
	 *
	 * @fontosdk
	 */
	contextNodeId: NodeId;
	/**
	 * @remarks
	 * The operation for removing the reference. Is by default {@link
	 * reference-delete}.
	 *
	 * @fontosdk
	 */
	deleteOperationName?: OperationName;
	/**
	 * @remarks
	 * Only when an editOperationName is used, a edit button is made. The edit
	 * operation should provide a way to edit the reference.
	 *
	 * @fontosdk
	 */
	editOperationName?: OperationName;
	/**
	 * @remarks
	 * Automatically set to true if the popover is opened in a read-only
	 * context, meaning either the reference is read-only or it is shown in a
	 * preview.
	 *
	 * @fontosdk
	 */
	isReadOnly?: boolean;
	/**
	 * @remarks
	 * Provide an alternative label for this reference, provided as
	 * REFERENCE_MARKUP_LABEL to the MessageFormat for the popover's
	 * description. If omitted, the configured markup label for the reference
	 * node is used instead.
	 *
	 * @fontosdk
	 */
	referenceMarkupLabel?: string;
	/**
	 * @remarks
	 * Determines the reference content with a xpath query, starting from the
	 * context node. Often this is just an attribute, for example `@href`.
	 *
	 * @fontosdk
	 */
	targetQuery: XPathQuery | XQExpression;
	/**
	 * @remarks
	 * Determines wether the result of the targetQuery should be resolved
	 * through the reference pipeline before it is passed to the
	 * resolveReference function.
	 *
	 * Defaults to false.
	 *
	 * @fontosdk
	 *
	 * @deprecated the reference pipeline will be removed in 8.10
	 */
	targetIsPermanentId?: boolean;
};

/**
 * @remarks
 * A component used for making popovers for cross references.
 *
 * To use this component - implement a component that renders this component,
 * directly passing the incoming popover data and setting the `resolveReference`
 * prop to a function that returns the documentId and optionally nodeId
 * corresponding to the target of the reference. This function is automatically
 * called with the result of the configured `targetQuery`:
 *
 * ```
 * function resolveMyReference(target: string, referenceNodeId: NodeId): Promise<{
 *     documentId: DocumentId,
 *     nodeId?: NodeId
 * }> {
 *     // TODO: find/load the target of this reference, e.g. for DITA:
 *     const referrerDocumentId = documentsManager.getDocumentIdByNodeId(
 *         referenceNodeId
 *     );
 *     return resolveDitaUrl(target, referrerDocumentId);
 * }
 *
 * const MyReferencePopover: FC<{data: CrossReferencePopoverData}> ({data}) => {
 *     const resolveReference = useCallback((target: string) => {
 *         return resolveMyReference(target, data.contextNodeId);
 *     }, [data.contextNodeId]);
 *
 *     return <CrossReferencePopover
 *         data={data}
 *         resolveReference={resolveReference}
 *     />;
 * };
 * ```
 *
 * To use the popover for a reference, first register it using the UiManager in
 * an install.ts:
 *
 * ```
 * export default function install(): void {
 *     uiManager.registerReactComponent(
 *         'MyReferencePopover',
 *         MyReferencePopover
 *     );
 * };
 * ```
 *
 * Then configure the popover to be used for your reference element in a
 * configureSxModule.ts file:
 *
 * ```
 * configureProperties(sxModule, xq`self::xref`, 'cross-link', {
 *     popoverComponentName: 'MyReferencePopover',
 *     popoverData: {
 *         targetQuery: xq`@href`,
 *         deleteOperationName: 'delete-my-reference',
 *         editOperationName: 'edit-my-reference',
 *     },
 * });
 * ```
 *
 * @fontosdk importable
 */
const CrossReferencePopover: FC<{
	/**
	 * @remarks
	 * The popoverData as provided by the family configuration. Custom popover
	 * components using CrossReferencePopover only need to pass through the data
	 * they receive themselves.
	 *
	 * @fontosdk
	 */
	data: CrossReferencePopoverData;
	/**
	 * @remarks
	 * Set this callback to control how the popover determines the target
	 * content corresponding to the result of the `data.targetQuery`.
	 *
	 * @fontosdk
	 *
	 * @param target - The result of `data.targetQuery`. If
	 *                 `data.targetIsPermanentId` is true, this is the result of
	 *                 resolving that value as a reference permanent ID.
	 *
	 * @returns The resolved target. This should be a promise that resolves into
	 *          an object containing the DocumentId and optionally NodeId of the
	 *          target content.
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
}> = ({ data, resolveReference }) => {
	const contextNode = useMemo(
		() => documentsManager.getNodeById(data.contextNodeId),
		[data.contextNodeId]
	);

	const target = useXPath<string>(data.targetQuery, contextNode, {
		expectedResultType: ReturnTypes.STRING,
	});

	type ResolvingState =
		| {
				state: 'resolved';
				documentId: DocumentId;
				nodeId?: NodeId;
				// TODO: can be removed if permanent IDs are not used
				metadata?: ReferenceMetadata & { title?: string };
		  }
		| { state: 'error' }
		| { state: 'loading' };
	const [resolvingState, setResolvingState] = useState<ResolvingState>({
		state: 'loading',
	});
	// TODO: can be replaced with directly calling `resolveReference` if
	//       permanent IDs are not used
	const resolveTarget = useCallback(
		async (target: string) => {
			let metadata: ReferenceMetadata | undefined;
			if (data.targetIsPermanentId) {
				const reference = await referencesManager.retrieveSingle(
					target
				);
				target = reference.target;
				metadata = reference.metadata;
			}
			const resolved = await resolveReference(target);

			return {
				...resolved,
				metadata,
			};
		},
		[data.targetIsPermanentId, resolveReference]
	);
	useEffect(() => {
		let canceled = false;
		setResolvingState({ state: 'loading' });
		if (target) {
			void resolveTarget(target).then(
				(resolved) => {
					if (canceled) {
						return;
					}
					setResolvingState({ state: 'resolved', ...resolved });
				},
				(_error) => {
					if (canceled) {
						return;
					}
					setResolvingState({ state: 'error' });
				}
			);
		}
		return () => {
			canceled = true;
		};
	}, [resolveTarget, target]);

	const editDeleteOperationData = useMemo(
		() => ({ contextNodeId: data.contextNodeId }),
		[data.contextNodeId]
	);

	return (
		<Popover maxWidth="500px" minWidth="220px">
			{resolvingState.state === 'error' && (
				<PopoverBody>
					<CompactStateMessage
						connotation="warning"
						message={t('Unable to retrieve this reference')}
						visual="exclamation-triangle"
					/>
				</PopoverBody>
			)}

			{resolvingState.state === 'loading' && (
				<PopoverBody>
					<CompactStateMessage
						message={t('Loading reference')}
						visual={<SpinnerIcon size="s" />}
					/>
				</PopoverBody>
			)}

			{resolvingState.state === 'resolved' && (
				<CrossReferencePopoverBody
					contextNodeId={data.contextNodeId}
					targetDocumentId={resolvingState.documentId}
					targetNodeId={resolvingState.nodeId}
					editOperationName={
						data.isReadOnly ? undefined : data.editOperationName
					}
					referenceMarkupLabel={data.referenceMarkupLabel}
					titleContent={resolvingState.metadata?.title}
				/>
			)}

			{!data.isReadOnly && data.contextNodeId && (
				<PopoverFooter>
					<FxOperationButton
						operationName={
							data.deleteOperationName ?? 'reference-delete'
						}
						operationData={editDeleteOperationData}
						focusEditorWhenDone
					/>

					{data.editOperationName && (
						<FxOperationButton
							type="primary"
							operationName={data.editOperationName}
							operationData={editDeleteOperationData}
							focusEditorWhenDone
						/>
					)}
				</PopoverFooter>
			)}
		</Popover>
	);
};

CrossReferencePopover.displayName = 'CrossReferencePopover';

export default CrossReferencePopover;
