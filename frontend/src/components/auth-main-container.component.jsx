const AuthMainContainer = ({ children }) => (
    <main className="flex flex-col gap-16 p-10 bg-basewhite w-[26.25rem]">
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
