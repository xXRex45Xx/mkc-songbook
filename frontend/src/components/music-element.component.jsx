const MusicElement = ({ type, detail }) => (
    <div className="flex flex-col justify-center items-end gap-1">
        <span className="text-sm font-semibold text-neutrals-900 uppercase">
            {type}
        </span>
        <span className="text-lg font-normal text-secondary">{detail}</span>
    </div>
);

export default MusicElement;
