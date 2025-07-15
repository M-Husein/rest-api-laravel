import { useContext } from "react";

import { ThemedLayoutContext } from "@/contexts/themedLayout"; // "@contexts"
import { IThemedLayoutContext } from "@/contexts/themedLayout/themedLayoutContext/IThemedLayoutContext"; // "@contexts/themedLayoutContext/IThemedLayoutContext"

export type UseThemedLayoutContextType = IThemedLayoutContext;

export const useThemedLayoutContext = (): UseThemedLayoutContextType => {
	const {
		mobileSiderOpen,
		siderCollapsed,
		setMobileSiderOpen,
		setSiderCollapsed,
	} = useContext(ThemedLayoutContext);

	return {
		mobileSiderOpen,
		siderCollapsed,
		setMobileSiderOpen,
		setSiderCollapsed,
	};
};
