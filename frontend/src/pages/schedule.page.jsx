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
import {
	Await,
	defer,
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import { getAllOrSearchLogBook } from "../utils/api/logbook-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";

const SchedulePage = () => {
	const navigate = useNavigate();
	const loaderData = useLoaderData();
	const user = useSelector((state) => state.user.currentUser);
	const [searchParams, setSearchParams] = useSearchParams();

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
						onClick={() => navigate("/schedule/new")}
					>
						New Schedule
						<img src={scheduleIcon} alt="" />
					</Button>
				) : (
					<></>
				)
			}
		>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.scheduleData}>
					{({ logBook, totalPages }) => (
						<>
							<p className="self-stretch font-normal text-lg text-neutrals-900">
								View your choir presentation schedule here. It updates
								automatically with the latest changes.
							</p>
							<CustomTable
								headers={tableHeaders}
								pagination
								totalPages={totalPages}
								onPageChange={(p) => {
									setSearchParams((prev) => {
										prev.set("page", p);
										return prev;
									});
								}}
								currentPage={
									searchParams.get("page")
										? parseInt(searchParams.get("page"))
										: 1
								}
							>
								{logBook.map((log) => (
									<Table.Row key={log._id}>
										<Table.Cell>
											<span className="font-bold mr-5">
												{log.serviceDate.getDate()}
											</span>
											<span className="mr-5">
												{log.serviceDate.toLocaleDateString("en-US", {
													month: "short",
												})}
												,{" "}
												{log.serviceDate.toLocaleDateString("en-US", {
													weekday: "long",
												})}
											</span>
											{log.serviceDate.toLocaleTimeString("en-US", {
												hour: "numeric",
											})}
										</Table.Cell>
										<Table.Cell
											className={`font-semibold ${
												log.cancelled ? "text-error-300 line-through" : ""
											}`}
										>
											{log.churchName}
										</Table.Cell>
										<Table.Cell>
											{log.cancelled ? (
												<div className="flex gap-1.5 items-center text-red-600">
													<img src={red} />
													Cancelled
												</div>
											) : log.recentlyAdded ? (
												<div className="flex gap-1.5 items-center text-green-400">
													<img src={green} />
													Recently Added
												</div>
											) : log.recentlyUpdated ? (
												<div className="flex gap-1.5 items-center text-orange-300">
													<img src={orange} alt="" />
													Recently Changed
												</div>
											) : (
												<></>
											)}
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
								))}
							</CustomTable>
						</>
					)}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};
export default SchedulePage;

export const loader = ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const page = searchParams.get("page");
	return defer({
		scheduleData: getAllOrSearchLogBook(page ? page : 1),
	});
};
