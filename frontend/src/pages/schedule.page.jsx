import MainBodyContainer from "../components/main-body-container.component";
import { Button, Table } from "flowbite-react";
import green from "../assets/green.svg";
import orange from "../assets/orange.svg";
import red from "../assets/red.svg";
import CustomTable from "../components/custom-table.component";
import { uploadButtonTheme } from "../config/button-theme.config";
import scheduleIcon from "../assets/schedule.svg";
import { useSelector } from "react-redux";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import { Link } from "react-router-dom";

const SchedulePage = () => {
	const user = useSelector((state) => state.user.currentUser);

	const tableHeaders =
		user?.role == "member"
			? [
					{ align: "left", name: "DATE" },
					{ align: "left", name: "LOCATION" },
			  ]
			: [
					{ align: "left", name: "DATE" },
					{ align: "left", name: "LOCATION" },
					{ align: "left", name: "" },
					{ align: "right", name: "ACTIONS" },
			  ];
	return (
		<MainBodyContainer
			title={"Schedule"}
			titleHelper={
				["admin", "super-admin"].includes(user?.role) ? (
					<Button
						color="failure"
						className="text-nowrap focus:ring-0 h-full"
						theme={uploadButtonTheme}
						size="xs"
					>
						New Schedule
						<img src={scheduleIcon} alt="" />
					</Button>
				) : (
					<></>
				)
			}
		>
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
					<Table.Cell className="font-semibold">Hiwot Berhan Church</Table.Cell>
					<Table.Cell />
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell>Hiwot Berhan Church</Table.Cell>
					<Table.Cell />
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell className="font-semibold">Hiwot Berhan Church</Table.Cell>
					<Table.Cell className="text-green-400">
						<div className="flex gap-1.5 items-center">
							<img src={green} />
							Recently Added
						</div>
					</Table.Cell>
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell className="font-semibold">Hiwot Berhan Church</Table.Cell>
					<Table.Cell className="text-orange-300">
						<div className="flex gap-1.5 items-center">
							<img src={orange} alt="" />
							Recently Changed
						</div>
					</Table.Cell>
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell className="font-semibold text-error-300 line-through">
						Hiwot Berhan Church
					</Table.Cell>
					<Table.Cell className="text-red-600">
						<div className="flex gap-1.5 items-center">
							<img src={red} />
							Cancelled
						</div>
					</Table.Cell>
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						<span className="font-bold mr-5">16</span>
						<span className="mr-5"> Aug, Friday</span>8 - 10am
					</Table.Cell>
					<Table.Cell className="font-semibold">Hiwot Berhan Church</Table.Cell>
					<Table.Cell />
					{["admin", "super-admin"].includes(user?.role) ? (
						<Table.Cell className="text-end flex justify-end gap-7">
							<Link className="cursor-pointer">
								<img src={editIcon} alt="edit" />
							</Link>
							<button className="cursor-pointer">
								<img src={deleteIcon} alt="delete" />
							</button>
						</Table.Cell>
					) : (
						<></>
					)}
				</Table.Row>
			</CustomTable>
		</MainBodyContainer>
	);
};
export default SchedulePage;
