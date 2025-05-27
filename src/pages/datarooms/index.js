import DataroomsPage from "../../components/HomePage/DataroomsPage";
import HomePageWrapper from "../../components/HomePage/HomePageWrapper";

export default function Home() {
    return (
        <HomePageWrapper subPageValue={0}>
            <DataroomsPage />
        </HomePageWrapper>
    );
}
