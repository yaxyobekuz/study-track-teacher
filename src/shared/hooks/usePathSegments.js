// Router
import { useLocation } from "react-router-dom";

/**
 * Hook that exposes the current location and path segments.
 * @returns {{pathSegments: string[], location: import("react-router-dom").Location}} Path segments and location.
 */
const usePathSegments = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean) || [];
  const isHomePage = pathSegments.length === 0;

  const matchSegment = (segment, index = 0) => {
    return pathSegments?.[index]?.toLowerCase() === segment?.toLowerCase();
  };

  return { pathSegments, location, isHomePage, matchSegment };
};

export default usePathSegments;
