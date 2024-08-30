const MainBodyContainer = ({ children, title }) => (
    <main className="py-10 px-20 flex flex-col flex-1 items-start gap-7 overflow-auto">
        <h1 className="text-baseblack text-3xl font-bold leading-9">{title}</h1>
        {children}
    </main>
);

export default MainBodyContainer;
