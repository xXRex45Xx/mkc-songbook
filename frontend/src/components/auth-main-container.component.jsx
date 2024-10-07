const AuthMainContainer = ({ children }) => (
    <main className="flex flex-col gap-7 py-10 px-5 bg-basewhite md:self-stretch md:min-w-[26.25rem] md:px-8 lg:p-10 md:gap-16">
        <div className="flex items-center gap-3">
            <img src="/logo.svg" className="mr-3 h-8 rounded-md shadow-xl" />
            <span className="text-2xl font-semibold text-baseblack">
                MKC Choir
            </span>
        </div>
        {children}
    </main>
);

export default AuthMainContainer;
