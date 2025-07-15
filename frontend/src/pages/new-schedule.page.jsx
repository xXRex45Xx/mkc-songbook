import { Form, useNavigate } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Datepicker, Label, TextInput, Button } from "flowbite-react";
import { datePickerTheme } from "../config/date-picker.config";

const NewSchedule = () => {
	const navigate = useNavigate();

	return (
		<MainBodyContainer title="New Schedule">
			<Form className="flex-1 flex flex-col gap-5 self-stretch">
				<div className="flex gap-3.5">
					<div className="flex flex-col gap-1.5">
						<Label
							className="text-baseblack text-lg font-semibold"
							htmlFor="service-date"
							value="Set Date"
						/>
						<Datepicker
							id="service-date"
							name="service-date"
							inline
							minDate={new Date()}
							theme={datePickerTheme}
						/>
					</div>
					<div className="flex-1 flex flex-col gap-1.5">
						<Label
							className="text-baseblack text-lg font-semibold"
							htmlFor="service-time"
							value="Set Time"
						/>
						<div className="flex px-2.5 justify-between items-center">
							<div className="flex flex-col gap-2.5">
								<Label className="text-baseblack italic" value="Morning" />
								<div className="flex flex-wrap gap-2.5">
									{[2, 3, 4, 5].map((val) => (
										<>
											<li>
												<input
													type="radio"
													id={`$${val}-am-amh`}
													value=""
													className="hidden peer"
													name="service-time"
												/>
												<label
													for={`$${val}-am-amh`}
													className="mr-1 inline-flex items-center justify-center py-2 px-3 text-xs font-medium text-center border rounded-lg cursor-pointer text-secondary border-secondary-400 peer-checked:border-secondary peer-checked:bg-secondary hover:text-white peer-checked:text-white hover:bg-secondary-600"
												>
													{`${val}:00 ጠዋት`}
												</label>
											</li>
											<li>
												<input
													type="radio"
													id={`$${val}-30-am-amh`}
													value=""
													className="hidden peer"
													name="service-time"
												/>
												<label
													for={`$${val}-30-am-amh`}
													className="mr-1 inline-flex items-center justify-center py-2 px-3 text-xs font-medium text-center border rounded-lg cursor-pointer text-secondary border-secondary-400 peer-checked:border-secondary peer-checked:bg-secondary hover:text-white peer-checked:text-white hover:bg-secondary-600"
												>
													{`${val}:30 ጠዋት`}
												</label>
											</li>
										</>
									))}
								</div>
							</div>
							<div className="flex flex-col gap-2.5">
								<Label className="text-baseblack italic" value="Afternoon" />
								<div className="flex flex-wrap gap-2.5">
									{[6, 7, 8, 9, 10, 11].map((val) => (
										<>
											<li>
												<input
													type="radio"
													id={`$${val}-pm-amh`}
													value=""
													className="hidden peer"
													name="service-time"
												/>
												<label
													for={`$${val}-pm-amh`}
													className="mr-1 inline-flex items-center justify-center py-2 px-3 text-xs font-medium text-center border rounded-lg cursor-pointer text-secondary border-secondary-400 peer-checked:border-secondary peer-checked:bg-secondary hover:text-white peer-checked:text-white hover:bg-secondary-600"
												>
													{`${val}:00 ከሰዓት`}
												</label>
											</li>
											<li>
												<input
													type="radio"
													id={`$${val}-30-pm-amh`}
													value=""
													className="hidden peer"
													name="service-time"
												/>
												<label
													for={`$${val}-30-pm-amh`}
													className="mr-1 inline-flex items-center justify-center py-2 px-3 text-xs font-medium text-center border rounded-lg cursor-pointer text-secondary border-secondary-400 peer-checked:border-secondary peer-checked:bg-secondary hover:text-white peer-checked:text-white hover:bg-secondary-600"
												>
													{`${val}:30 ከሰዓት`}
												</label>
											</li>
										</>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-1.5 self-stretch">
					<Label
						htmlFor="location"
						className="text-baseblack text-lg font-semibold"
						value="Location"
					/>
					<TextInput
						helperText={
							<span className="text-neutrals-800 text-xs">
								Name of the church in which the service will be conducted.
							</span>
						}
					/>
				</div>
				<div className="flex justify-end gap-7 mt-auto">
					<Button
						onClick={() => navigate(-1)}
						className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary px-7"
					>
						Cancel
					</Button>
					<Button
						color="failure"
						className="text-nowrap focus:ring-0 h-full px-7"
						type="submit"
					>
						{location.pathname.includes("edit") ? "Update" : "Submit"}
					</Button>
				</div>
			</Form>
		</MainBodyContainer>
	);
};

export default NewSchedule;
