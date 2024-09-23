const MainBodyContainer = ({ children, title, titleHelper }) => (
    <main className="py-10 px-20 flex flex-col flex-1 items-start gap-7 overflow-auto">
        {title && (
            <div className="flex justify-between items-center self-stretch">
                <h1 className="text-baseblack text-3xl font-bold leading-9">
                    {title}
                </h1>
                {titleHelper}
            </div>
        )}
        {children}
    </main>
);

export default MainBodyContainer;
