"use client";

import { useAuth } from "@/context/AuthContext";
import NotFound from "../NotFound/NotFound";

const ClientsPage = () => {
  const { user } = useAuth();

  if (user && !user.isAdmin) {
    return <NotFound title={""} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl">Clients Page</h1>
    </div>
  );
};

export default ClientsPage;
