import { Pagination, Table } from "flowbite-react";
import { tableTheme } from "../config/table-theme.config";
import { forwardRef } from "react";

const CustomTable = forwardRef(
    (
        {
            title,
            headers,
            children,
            overflowAuto,
            pagination,
            totalPages,
            onPageChange,
            currentPage,
        },
        ref
    ) => (
        <div
            className={`flex flex-col self-stretch ${
                overflowAuto ? "overflow-auto" : ""
            }`}
        >
            <h2 className="text-baseblack text-base md:text-2xl font-bold leading-9">
                {title}
            </h2>
            <Table ref={ref} theme={tableTheme} hoverable>
                <Table.Head>
                    {headers.map((header) => (
                        <Table.HeadCell key={header.name} align={header.align}>
                            {header.name}
                        </Table.HeadCell>
                    ))}
                </Table.Head>
                <Table.Body className="divide-y">{children}</Table.Body>
            </Table>
            {pagination && (
                <Pagination
                    className="self-end"
                    currentPage={parseInt(currentPage)}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    )
);

export default CustomTable;
