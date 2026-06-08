import { redirect } from "next/navigation";

import { dashboardRoute } from "@/lib/routes";

const Home = () => {
  redirect(dashboardRoute());
};

export default Home;
