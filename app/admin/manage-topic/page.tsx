import React from "react";
import TopicManagementClient from "./TopicManagementClient";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const TopicManagePage = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/topics`,
    {
      cache: "no-store",
    }
  );
  const topics = await res.json();

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          จัดการข้อมูลหัวข้อกองบุญ
        </h1>
        {/* ส่งข้อมูลหัวข้อที่ดึงได้ไปยัง Client Component */}
        <TopicManagementClient initialTopics={topics} />
      </main>
      <ScrollToTop />
    </div>
  );
};
export default TopicManagePage;
