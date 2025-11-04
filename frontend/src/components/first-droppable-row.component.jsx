import { useDroppable } from "@dnd-kit/core";
import { Table } from "flowbite-react";

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
