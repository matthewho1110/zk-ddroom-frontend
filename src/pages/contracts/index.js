import ContractsPage from "../../components/HomePage/ContractsPage";
import HomePageWrapper from "../../components/HomePage/HomePageWrapper";

export default function View() {
    return (
        <HomePageWrapper subPageValue={1}>
            <ContractsPage />
        </HomePageWrapper>
    );
}
