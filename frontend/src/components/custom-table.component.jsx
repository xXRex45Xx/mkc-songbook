import { Pagination, Table } from "flowbite-react";
import { tableTheme } from "../config/table-theme.config";
import { forwardRef } from "react";

/**
 * Custom Table Component
 *
 * A reusable table component with optional pagination and custom styling.
 * Features:
 * - Optional title display
 * - Configurable headers
 * - Hover effects on rows
 * - Optional pagination controls
 * - Auto overflow handling
 * - Forward ref support for scrolling
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title] - Table title to display
 * @param {Array<{name: string, align: string}>} props.headers - Table header configuration
 * @param {React.ReactNode} props.children - Table body content
 * @param {boolean} [props.overflowAuto] - Whether to enable auto overflow
 * @param {boolean} [props.pagination] - Whether to show pagination controls
 * @param {number} [props.totalPages] - Total number of pages for pagination
 * @param {Function} [props.onPageChange] - Handler for page changes
 * @param {number} [props.currentPage] - Current active page
 * @param {React.Ref} ref - Forwarded ref for table element
 */
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
