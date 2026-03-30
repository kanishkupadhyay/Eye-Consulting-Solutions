/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Briefcase,
  Calendar,
  CheckCircle,
  Download,
  PencilLine,
} from "lucide-react";
import StatsCard from "../StatsCard/StatsCard";
import { StatsCardType } from "../StatsCard/StatsCard.Model";
import DataTable from "../DataTable/DataTable";
import { useEffect, useState } from "react";
import Link from "next/link";
import getUsers from "@/services/frontend/get-users";
import { formatDateNumeric } from "../utils";
import { useAuth } from "@/context/AuthContext";
import NotFound from "../NotFound/NotFound";
import SelectDropdown from "../SelectDropdown/SelectDropdown";

const pageSize = 20;

const DashboardPage = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [resumeFilter, setResumeFilter] = useState<string>("today");

  const { user } = useAuth();

  const fetchUsers = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await getUsers({
        page: pageNumber,
        limit: pageSize,
      });

      setData(
        res.data.map((item: any) => ({
          ...item,
          lastLogin: formatDateNumeric(item?.lastLogin),
        })) || []
      );

      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !user.isAdmin) return;
    fetchUsers(page);
  }, [page, user]);

  if (user && !user.isAdmin) {
    return <NotFound title={""} />;
  }

  // Options for dropdown with full label
  const resumeOptions = [
    { value: "today", label: "Resume Uploaded (Today)" },
    { value: "thisWeek", label: "Resume Uploaded (This Week)" },
    { value: "thisMonth", label: "Resume Uploaded (This Month)" },
  ];

  const columns: any[] = [
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Email", accessor: "email" },
    {
      header: "Password",
      accessor: "password",
      render: () => "••••••••",
    },
    { header: "Phone", accessor: "phone" },
    { header: "Last Login", accessor: "lastLogin" },

    // Resume Count Column with label-value dropdown
    {
      header: (
        <div className="inline-flex items-center w-64 select-none cursor-pointer">
          <SelectDropdown
            label=""
            options={resumeOptions}
            value={resumeFilter}
            onChange={(val) => setResumeFilter(val)}
            placeholder=""
          />
        </div>
      ),
      accessor: "resumeCountConfig",
      render: (row: any) => {
        const config = row.resumeCountConfig || {};
        return config[resumeFilter] || 0;
      },
    },

    {
      header: "Action",
      accessor: "_id",
      render: (row: any) => (
        <Link
          href={`/users/${row._id}`}
          className="text-orange-500 hover:underline font-medium text-sm flex items-center"
        >
          <PencilLine size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applicants"
          value={247}
          icon={<Download className="text-orange-500" />}
          trendText="↑ 18% this month"
          trendType="up"
          type={StatsCardType.ORANGE}
        />

        <StatsCard
          title="Interviews Scheduled"
          value={38}
          icon={<Calendar className="text-blue-500" />}
          trendText="↑ 7 this week"
          trendType="up"
          type={StatsCardType.BLUE}
        />

        <StatsCard
          title="Offers Extended"
          value={14}
          icon={<CheckCircle className="text-green-500" />}
          trendText="↑ 3 pending"
          trendType="up"
          type={StatsCardType.GREEN}
        />

        <StatsCard
          title="Open Positions"
          value={12}
          icon={<Briefcase className="text-purple-500" />}
          trendText="↓ 2 closed"
          trendType="down"
          type={StatsCardType.PURPLE}
        />
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        total={totalCount}
      />
    </div>
  );
};

export default DashboardPage;
