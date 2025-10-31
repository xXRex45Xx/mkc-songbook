import { TailSpin } from "react-loader-spinner";

/**
 * Custom Tail Spin Loading Component
 *
 * A styled loading spinner component with size and color variants.
 * Centers itself in the available space.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.small] - Whether to use small size (30px vs 80px)
 * @param {boolean} [props.white] - Whether to use white color instead of default red
 */
const CustomTailSpin = ({ small, white, xs }) => (
	<TailSpin
		visible={true}
		height={small ? "30" : xs ? "20" : "80"}
		width={small ? "30" : xs ? "20" : "80"}
		color={white ? "#FCFDFE" : "#C9184A"}
		ariaLabel="tail-spin-loading"
		radius="2"
		wrapperClass="flex-1 self-stretch flex justify-center items-center"
	/>
);

export default CustomTailSpin;
