import MainBodyContainer from "../components/main-body-container.component";
import { Table } from "flowbite-react";
import green from "../assets/green.svg";
import orange from "../assets/orange.svg";
import red from "../assets/red.svg";

const SchedulePage = () => {
	return (
		<MainBodyContainer title={"Schedule"}>
			<p className="self-stretch font-normal text-[18px] leading-[1.2] text-inherit">
				View your choir presentation schedule here. It updates automatically
				with the latest changes.
			</p>

			<div className="w-screen h-screen overflow-x-auto">
				<Table hoverable>
					<Table.Body className="divide-y">
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								16
							</Table.Cell>

							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								17
							</Table.Cell>
							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								18
							</Table.Cell>
							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell className="text-green-400 flex">
								<img src={green} />
								Recently Added
							</Table.Cell>
						</Table.Row>
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								17
							</Table.Cell>
							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell className="text-orange-300 flex">
								<img src={orange} alt="" />
								Recently Changed
							</Table.Cell>
						</Table.Row>
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								17
							</Table.Cell>
							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell className="text-red-600 flex">
								<img src={red} />
								Cancelled
							</Table.Cell>
						</Table.Row>
						<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
							<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
								17
							</Table.Cell>
							<Table.Cell>Aug, Friday</Table.Cell>
							<Table.Cell>8 - 10am</Table.Cell>
							<Table.Cell>Hiwot Berhan Church</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
			</div>
		</MainBodyContainer>
	);
};
export default SchedulePage;
