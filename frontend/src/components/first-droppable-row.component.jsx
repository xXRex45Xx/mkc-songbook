/**
 * @fileoverview First droppable row component for drag-and-drop reordering
 * Provides visual placeholder for sortable table rows
 */

import { useDroppable } from "@dnd-kit/core";
import { Table } from "flowbite-react";

/**
 * First Droppable Row Component
 *
 * A visual placeholder row for drag-and-drop reordering.
 * Appears as the first row in sortable tables and provides
 * a drop target for dragged items.
 *
 * Features:
 * - DnD Kit droppable integration
 * - Visual feedback when item is dropped
 * - Conditional height based on drop state
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.disabled] - Whether drag-and-drop is disabled
 */
const FirstDroppableRow = ({ disabled }) => {
	const { setNodeRef, isOver } = useDroppable({ id: 0, disabled });

	return (
		<Table.Row
			ref={setNodeRef}
			className={isOver ? "h-10" : "h-0.5 z-10"}
		></Table.Row>
	);
};

export default FirstDroppableRow;
