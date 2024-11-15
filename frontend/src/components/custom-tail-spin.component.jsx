import { TailSpin } from "react-loader-spinner";

const CustomTailSpin = ({ small, white }) => (
    <TailSpin
        visible={true}
        height={small ? "30" : "80"}
        width={small ? "30" : "80"}
        color={white ? "#FCFDFE" : "#C9184A"}
        ariaLabel="tail-spin-loading"
        radius="2"
        wrapperClass="flex-1 self-stretch flex justify-center items-center"
    />
);

export default CustomTailSpin;
