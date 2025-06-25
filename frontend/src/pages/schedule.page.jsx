import MainBodyContainer from "../components/main-body-container.component";
import { Table } from "flowbite-react";
import green from "../assets/green.svg";
import orange from "../assets/orange.svg";
import red from "../assets/red.svg";
import CustomTable from "../components/custom-table.component";

const SchedulePage = () => {
	const tableHeaders = [
		{ align: "left", name: "DATE" },
		{ align: "left", name: "LOCATION" },
	];

	return (
		<MainBodyContainer title={"Schedule"}>
			<p className="self-stretch font-normal text-lg text-neutrals-900">
				View your choir presentation schedule here. It updates automatically
				with the latest changes.
			</p>
			<CustomTable headers={tableHeaders}>
				<Table.Row className="text-secondary">
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5">Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell></Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell></Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell className="text-green-400 flex">
						<img src={green} />
						Recently Added
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell className="text-orange-300 flex">
						<img src={orange} alt="" />
						Recently Changed
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell className="text-red-600 flex">
						<img src={red} />
						Cancelled
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell></Table.Cell>
				</Table.Row>
			</CustomTable>
			{/* <Table>
				<Table.Body className="divide-y">
					
				</Table.Body>
			</Table> */}
		</MainBodyContainer>
	);
};
export default SchedulePage;
