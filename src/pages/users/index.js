import UsersPage from "../../components/HomePage/UsersPage";
import HomePageWrapper from "../../components/HomePage/HomePageWrapper";

export default function Home() {
    return (
        <HomePageWrapper subPageValue={2}>
            <UsersPage />
        </HomePageWrapper>
    );
}
