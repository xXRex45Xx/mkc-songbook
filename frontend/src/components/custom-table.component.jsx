import { Table } from "flowbite-react";
import { tableTheme } from "../config/table-theme.config";

const CustomTable = ({ headers, children, overflow_auto }) => (
    <div className={`self-stretch ${overflow_auto ? "overflow-auto" : ""}`}>
        <Table theme={tableTheme} hoverable>
            <Table.Head>
                {headers.map((header) => (
                    <Table.HeadCell key={header.name} align={header.align}>
                        {header.name}
                    </Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body className="divide-y">{children}</Table.Body>
        </Table>
    </div>
);

export default CustomTable;
