import { Table } from "flowbite-react";
import { tableTheme } from "../config/table-theme.config";

const CustomTable = ({ headers, children }) => (
    <div className="self-stretch overflow-auto">
        <Table theme={tableTheme} hoverable>
            <Table.Head>
                {headers.map((header) => (
                    <Table.HeadCell key={header} align={header.align}>
                        {header.name}
                    </Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body className="divide-y">{children}</Table.Body>
        </Table>
    </div>
);

export default CustomTable;
