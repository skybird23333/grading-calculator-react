import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

/**
 * Thanks react ecosystem
 */
export default function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }

    return ComponentWithRouterProp;
}